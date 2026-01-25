import { Component, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { PostService } from '../../services/post.service';
import { SocialService } from '../../services/social.service';
import { Post } from '../../models/post.model';
import { PostDialogComponent } from '../post-dialog/post-dialog';
import { AuthService } from '../../services/auth.service';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';

@Component({
  selector: 'app-post-feed',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatMenuModule,
    TimeAgoPipe,
  ],
  templateUrl: './post-feed.html',
  styleUrls: ['./post-feed.scss'],
})
export class PostFeedComponent implements OnInit {
  posts = signal<Post[]>([]);
  loading = signal(false);
  page = signal(0);
  totalPages = signal(0);
  currentUserId = signal<string | null>(null);
  likedPosts = signal(new Set<string>());

  constructor(
    private postService: PostService,
    private socialService: SocialService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.currentUserId.set(this.authService.currentUser?.id || null);
    this.loadPosts();
  }

  loadPosts() {
    if (this.loading()) return;

    this.loading.set(true);
    this.cdr.detectChanges();
    this.postService.getPosts(this.page(), 10).subscribe({
      next: (response) => {
        const posts = response.content.map((post) => ({
          ...post,
          mediaUrls:
            post.mediaUrls?.map((url) =>
              url.startsWith('/') ? `http://localhost:8080${url}` : url
            ) || [],
        }));
        this.posts.set([...this.posts(), ...posts]);
        this.totalPages.set(response.totalPages);
        this.loading.set(false);
        this.cdr.detectChanges();

        this.posts().forEach((post) => this.checkLikeStatus(post.id));
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.loading.set(false);
        this.cdr.detectChanges();
      },
    });
  }

  checkLikeStatus(postId: string) {
    this.socialService.getLikeStatus(postId).subscribe({
      next: (status) => {
        if (status.liked) {
          // create a new Set to trigger change detection when using signals
          this.likedPosts.set(new Set([...this.likedPosts(), postId]));
        }
      },
      error: () => {},
    });
  }

  loadMore() {
    if (this.page() < this.totalPages() - 1) {
      this.page.set(this.page() + 1);
      this.loadPosts();
    }
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(PostDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.posts.set([]);
        this.page.set(0);
        this.loadPosts();
      }
    });
  }

  viewPost(postId: string) {
    this.router.navigate(['/post', postId]);
  }

  canEdit(post: Post): boolean {
    return this.currentUserId() === post.owner.id;
  }

  editPost(post: Post, event: Event) {
    event.stopPropagation();
    const dialogRef = this.dialog.open(PostDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { post },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.posts.set([]);
        this.page.set(0);
        this.loadPosts();
      }
    });
  }

  deletePost(postId: string, event: Event) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this post?')) {
      this.postService.deletePost(postId).subscribe({
        next: () => {
          this.posts.set(this.posts().filter((p) => p.id !== postId));
        },
        error: (error) => {
          console.error('Error deleting post:', error);
          alert('Failed to delete post');
        },
      });
    }
  }

  toggleLike(postId: string, event: Event) {
    event.stopPropagation();
    this.socialService.toggleLike(postId).subscribe({
      next: (response) => {
        // update likedPosts set immutably
        if (response.liked) {
          this.likedPosts.set(new Set([...this.likedPosts(), postId]));
        } else {
          const newSet = new Set(this.likedPosts());
          newSet.delete(postId);
          this.likedPosts.set(newSet);
        }

        // update posts signal immutably
        this.posts.set(
          this.posts().map((p) =>
            p.id === postId
              ? {
                  ...p,
                  likeCount: response.liked
                    ? (p.likeCount || 0) + 1
                    : Math.max((p.likeCount || 0) - 1, 0),
                }
              : p
          )
        );
      },
      error: (error) => {
        console.error('Error toggling like:', error);
      },
    });
  }

  isLiked(postId: string): boolean {
    return this.likedPosts().has(postId);
  }

  isVideo(url: string): boolean {
    return ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv', '.flv', '.mkv'].some((ext) =>
      url.toLowerCase().includes(ext)
    );
  }
}
