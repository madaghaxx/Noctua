import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SubscriptionService } from '../../services/subscription.service';
import { AuthService } from '../../services/auth.service';
import { SocialService } from '../../services/social.service';
import { PostService } from '../../services/post.service';
import { CommentResponse, PageResponse } from '../../models/social.model';
import { Post, PageResponse as PostPageResponse } from '../../models/post.model';
import { User } from '../../models/auth.model';
import { UserService } from '../../services/user';
import { combineLatest } from 'rxjs';
import { SharedHeaderComponent } from '../shared-header/shared-header';
import { ReportDialogComponent } from '../report-dialog/report-dialog';
import { ReportService } from '../../services/report.service';

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
    MatDialogModule,
    MatSnackBarModule,
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

  user = signal<User | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private subscriptionService: SubscriptionService,
    private authService: AuthService,
    private socialService: SocialService,
    private postService: PostService,
    private userService: UserService,
    private dialog: MatDialog,
    private reportService: ReportService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    combineLatest([this.route.params, this.authService.currentUser$]).subscribe(
      ([params, user]) => {
        this.userId.set(params['id']);
        this.currentUserId.set(user?.id || null);
        this.isOwnProfile.set(this.userId() === this.currentUserId());
        if (!user) {
          this.loading.set(false);
          this.user.set(null);
          this.isSubscribed.set(false);
          this.subscriberCount.set(0);
          this.subscriptionCount.set(0);
          this.comments.set([]);
          this.posts.set([]);
          this.router.navigate(['/login']);
          return;
        }

        this.loadProfile();
      }
    );
  }

  loadProfile(): void {
    this.loading.set(true);

    const targetUserId = this.userId();
    if (!targetUserId) {
      this.loading.set(false);
      return;
    }

    if (!this.currentUserId()) {
      this.loading.set(false);
      return;
    }

    this.userService.getUserById(targetUserId).subscribe({
      next: (user) => {
        this.user.set(user);
      },
      error: () => {
        const fallbackUserId = this.currentUserId();
        if (fallbackUserId && fallbackUserId !== targetUserId) {
          this.router.navigate(['/profile', fallbackUserId]);
          return;
        }

        if (this.isOwnProfile()) {
          this.userService.getCurrentUser().subscribe({
            next: (currentUser) => {
              this.user.set(currentUser);
            },
          });
        }
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

  openReportUserDialog(): void {
    const targetUserId = this.userId();
    if (!targetUserId || this.isOwnProfile()) return;

    const dialogRef = this.dialog.open(ReportDialogComponent, {
      width: '400px',
      data: { title: 'Report User' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.reportService
          .createReport({
            reportedUserId: targetUserId,
            reportedPostId: null,
            reason: result.reason,
            details: result.details,
          })
          .subscribe({
            next: () => {
              this.snackBar.open('Report submitted successfully.', 'Close', {
                duration: 3000,
              });
            },
            error: () => {
              this.snackBar.open('Failed to submit report.', 'Close', {
                duration: 3000,
              });
            },
          });
      }
    });
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }
}
