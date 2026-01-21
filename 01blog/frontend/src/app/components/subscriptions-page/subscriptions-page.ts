import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { SubscriptionService } from '../../services/subscription.service';
import { AuthService } from '../../services/auth.service';
import { SubscriptionResponse } from '../../models/social.model';

@Component({
  selector: 'app-subscriptions-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
  ],
  templateUrl: './subscriptions-page.html',
  styleUrl: './subscriptions-page.scss',
})
export class SubscriptionsPageComponent implements OnInit {
  currentUserId: string | null = null;
  subscriptions: SubscriptionResponse[] = [];
  subscribers: SubscriptionResponse[] = [];
  loadingSubscriptions = false;
  loadingSubscribers = false;

  constructor(
    private subscriptionService: SubscriptionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUserId = user?.id || null;
      if (this.currentUserId) {
        this.loadSubscriptions();
        this.loadSubscribers();
      }
    });
  }

  loadSubscriptions(): void {
    if (!this.currentUserId) return;

    this.loadingSubscriptions = true;
    this.subscriptionService.getSubscriptions(this.currentUserId).subscribe({
      next: (response) => {
        this.subscriptions = response.content;
        this.loadingSubscriptions = false;
      },
      error: () => {
        this.loadingSubscriptions = false;
      },
    });
  }

  loadSubscribers(): void {
    if (!this.currentUserId) return;

    this.loadingSubscribers = true;
    this.subscriptionService.getSubscribers(this.currentUserId).subscribe({
      next: (response) => {
        this.subscribers = response.content;
        this.loadingSubscribers = false;
      },
      error: () => {
        this.loadingSubscribers = false;
      },
    });
  }

  viewProfile(userId: string): void {
    this.router.navigate(['/profile', userId]);
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  }
}
