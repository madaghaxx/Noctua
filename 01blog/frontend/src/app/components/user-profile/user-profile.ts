import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SubscriptionService } from '../../services/subscription.service';
import { AuthService } from '../../services/auth.service';
import { SocialService } from '../../services/social.service';
import { PostService } from '../../services/post.service';
import { CommentResponse, PageResponse } from '../../models/social.model';
import { Post, PageResponse as PostPageResponse } from '../../models/post.model';
import { SharedHeaderComponent } from '../shared-header/shared-header';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    RouterModule,
    SharedHeaderComponent,
  ],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfileComponent implements OnInit {
  userId = signal<string>('');
  currentUserId = signal<string | null>(null);
  isSubscribed = signal(false);
  subscriberCount = signal(0);
  subscriptionCount = signal(0);
  loading = signal(false);
  isOwnProfile = signal(false);
  comments = signal<CommentResponse[]>([]);
  posts = signal<Post[]>([]);

  // Mock user data - replace with actual API call
  user = signal<any>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private subscriptionService: SubscriptionService,
    private authService: AuthService,
    private socialService: SocialService,
    private postService: PostService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.userId.set(params['id']);
      this.loadProfile();
    });

    this.authService.currentUser$.subscribe((user) => {
      this.currentUserId.set(user?.id || null);
      this.isOwnProfile.set(this.userId() === this.currentUserId());
    });
  }

  loadProfile(): void {
    this.loading.set(true);

    // Load user data
    this.http.get<any>(`http://localhost:8080/api/users/${this.userId()}`).subscribe({
      next: (response) => {
        if (response.success) {
          this.user.set(response.data);
        }
      },
      error: () => {
        // User not found, but continue loading other data
      },
    });

    // Load subscription status
    if (!this.isOwnProfile()) {
      this.subscriptionService.getSubscriptionStatus(this.userId()).subscribe({
        next: (status) => {
          this.isSubscribed.set(status.subscribed);
          this.subscriberCount.set(status.subscriberCount);
          this.subscriptionCount.set(status.subscriptionCount);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
    } else {
      this.subscriptionService.getSubscriptionStatus(this.userId()).subscribe({
        next: (status) => {
          this.subscriberCount.set(status.subscriberCount);
          this.subscriptionCount.set(status.subscriptionCount);
          this.loading.set(false);
        },
      });
    }

    // Load user comments
    this.socialService.getUserComments(this.userId()).subscribe({
      next: (response: PageResponse<CommentResponse>) => {
        this.comments.set(response.content);
      },
      error: () => {
        // Comments loading failed, but don't block the profile
      },
    });

    // Load user posts
    this.postService.getUserPosts(this.userId()).subscribe({
      next: (response: PostPageResponse<Post>) => {
        this.posts.set(response.content);
      },
      error: () => {
        // Posts loading failed, but don't block the profile
      },
    });
  }

  toggleSubscription(): void {
    this.subscriptionService.toggleSubscription(this.userId()).subscribe({
      next: (response) => {
        this.isSubscribed.set(response.subscribed);
        this.subscriberCount.set(response.subscriberCount);
      },
    });
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }
}
