import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { SubscriptionService } from '../../services/subscription.service';
import { AuthService } from '../../services/auth.service';

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
  ],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfileComponent implements OnInit {
  userId!: string;
  currentUserId: string | null = null;
  isSubscribed = false;
  subscriberCount = 0;
  subscriptionCount = 0;
  loading = false;
  isOwnProfile = false;

  // Mock user data - replace with actual API call
  user: any = null;

  constructor(
    private route: ActivatedRoute,
    private subscriptionService: SubscriptionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.userId = params['id'];
      this.loadProfile();
    });

    this.authService.currentUser$.subscribe((user) => {
      this.currentUserId = user?.id || null;
      this.isOwnProfile = this.userId === this.currentUserId;
    });
  }

  loadProfile(): void {
    this.loading = true;

    // Load subscription status
    if (!this.isOwnProfile) {
      this.subscriptionService.getSubscriptionStatus(this.userId).subscribe({
        next: (status) => {
          this.isSubscribed = status.subscribed;
          this.subscriberCount = status.subscriberCount;
          this.subscriptionCount = status.subscriptionCount;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
    } else {
      this.subscriptionService.getSubscriptionStatus(this.userId).subscribe({
        next: (status) => {
          this.subscriberCount = status.subscriberCount;
          this.subscriptionCount = status.subscriptionCount;
          this.loading = false;
        },
      });
    }
  }

  toggleSubscription(): void {
    this.subscriptionService.toggleSubscription(this.userId).subscribe({
      next: (response) => {
        this.isSubscribed = response.subscribed;
        this.subscriberCount = response.subscriberCount;
      },
    });
  }
}
