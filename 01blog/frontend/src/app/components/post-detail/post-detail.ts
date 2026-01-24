import { Component, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { PostService } from '../../services/post.service';
import { SocialService } from '../../services/social.service';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../models/post.model';
import { CommentSectionComponent } from '../comment-section/comment-section';
import { PostDialogComponent } from '../post-dialog/post-dialog';
import { Nl2brPipe } from '../../pipes/nl2br.pipe';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatDialogModule,
    MatMenuModule,
    CommentSectionComponent,
    Nl2brPipe,
    TimeAgoPipe,
  ],
  templateUrl: './post-detail.html',
  styleUrls: ['./post-detail.scss'],
})
export class PostDetailComponent implements OnInit {
  post = signal<Post | null>(null);
  loading = signal(true);
  isLiked = signal(false);
  currentUserId = signal<string | null>(null);
  currentMediaIndex = signal(0);

  getAvatarUrl(): string {
    const avatar = this.post()?.owner?.avatar;
    return avatar ? `url(${avatar})` : 'none';
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private socialService: SocialService,
    private authService: AuthService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Get current user from auth service
    const currentUser = this.authService.currentUser;
    this.currentUserId.set(currentUser?.id || null);

    // Also subscribe to changes
    this.authService.currentUser$.subscribe((user) => {
      this.currentUserId.set(user?.id || null);
      this.cdr.detectChanges();
    });

    const postId = this.route.snapshot.paramMap.get('id');
    if (postId) {
      this.loadPost(postId);
      this.checkLikeStatus(postId);
    } else {
      this.router.navigate(['/']);
    }
  }

  loadPost(postId: string) {
    this.loading.set(true);
    this.cdr.detectChanges();
    this.postService.getPostById(postId).subscribe({
      next: (post) => {
        if (post.mediaUrls && post.mediaUrls.length > 0) {
          post.mediaUrls = post.mediaUrls.map((url) => {
            if (url.startsWith('/')) {
              return `http://localhost:8080${url}`;
            }
            return url;
          });
        }
        this.post.set(post);
        this.loading.set(false);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading post:', error);
        this.loading.set(false);
        this.cdr.detectChanges();
        alert('Post not found');
        this.router.navigate(['/']);
      },
    });
  }

  checkLikeStatus(postId: string) {
    this.socialService.getLikeStatus(postId).subscribe({
      next: (status) => {
        this.isLiked.set(status.liked);
      },
      error: () => {},
    });
  }

  toggleLike() {
    const post = this.post();
    if (!post) return;
    this.socialService.toggleLike(post.id).subscribe({
      next: (response) => {
        this.isLiked.set(response.liked);
        const currentPost = this.post();
        if (currentPost) {
          if (response.liked) {
            this.post.set({
              ...currentPost,
              likeCount: (currentPost.likeCount || 0) + 1,
            });
          } else {
            this.post.set({
              ...currentPost,
              likeCount: Math.max((currentPost.likeCount || 0) - 1, 0),
            });
          }
        }
      },
      error: (error) => {
        console.error('Error toggling like:', error);
      },
    });
  }

  canEdit(): boolean {
    const post = this.post();
    return post ? this.currentUserId() === post.owner.id : false;
  }

  editPost() {
    const post = this.post();
    if (!post) return;

    const dialogRef = this.dialog.open(PostDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { post: this.post },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const postId = this.post()?.id;
        if (postId) {
          this.loadPost(postId);
        }
      }
    });
  }

  deletePost() {
    const post = this.post();
    if (!post || !post.id) return;

    if (confirm('Are you sure you want to delete this post?')) {
      this.postService.deletePost(post.id).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error deleting post:', error);
          alert('Failed to delete post');
        },
      });
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }

  nextMedia() {
    const post = this.post();
    const mediaUrls = post?.mediaUrls;
    if (post && mediaUrls && this.currentMediaIndex() < mediaUrls.length - 1) {
      this.currentMediaIndex.set(this.currentMediaIndex() + 1);
    }
  }

  prevMedia() {
    if (this.currentMediaIndex() > 0) {
      this.currentMediaIndex.set(this.currentMediaIndex() - 1);
    }
  }

  viewProfile() {
    const post = this.post();
    if (post) {
      this.router.navigate(['/profile', post.owner.id]);
    }
  }

  // Safe accessors for template type-checking
  createdAt(): string {
    return this.post()?.createdAt ?? '';
  }

  mediaUrls(): string[] {
    return this.post()?.mediaUrls ?? [];
  }

  content(): string {
    return this.post()?.content ?? '';
  }

  postId(): string {
    return this.post()?.id ?? '';
  }

  setCurrentMediaIndex(index: number) {
    this.currentMediaIndex.set(index);
  }

  isVideo(url: string): boolean {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv'];
    return videoExtensions.some((ext) => url.toLowerCase().includes(ext));
  }

  onCommentAdded() {
    const currentPost = this.post();
    if (currentPost) {
      this.post.set({
        ...currentPost,
        commentCount: (currentPost.commentCount || 0) + 1,
      });
    }
  }

  onCommentDeleted() {
    const currentPost = this.post();
    if (currentPost) {
      this.post.set({
        ...currentPost,
        commentCount: Math.max((currentPost.commentCount || 0) - 1, 0),
      });
    }
  }

  getTimeAgo(date: string): string {
    const now = new Date().getTime();
    const past = new Date(date).getTime();
    const diff = Math.floor((now - past) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return new Date(date).toLocaleDateString();
  }
}
