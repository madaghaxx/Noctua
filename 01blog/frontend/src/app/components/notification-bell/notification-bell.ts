import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { NotificationResponse } from '../../models/social.model';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
  ],
  templateUrl: './notification-bell.html',
  styleUrl: './notification-bell.scss',
})
export class NotificationBellComponent implements OnInit {
  unreadCount = 0;
  notifications: NotificationResponse[] = [];
  loading = false;

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.notificationService.unreadCount$.subscribe((count) => {
      setTimeout(() => {
        this.unreadCount = count;
        this.cdr.detectChanges();
      });
    });
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.notificationService.getNotifications(0, 5).subscribe({
      next: (response) => {
        // Defer UI updates to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.notifications = response.content;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        setTimeout(() => {
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  onNotificationClick(notification: NotificationResponse): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe();
    }

    // Navigate based on notification type
    if (notification.type === 'LIKE' || notification.type === 'COMMENT') {
      this.router.navigate(['/post', notification.referenceId]);
    } else if (notification.type === 'SUBSCRIPTION') {
      this.router.navigate(['/profile', notification.referenceId]);
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.forEach((n) => (n.isRead = true));
    });
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'LIKE':
        return 'favorite';
      case 'COMMENT':
        return 'comment';
      case 'SUBSCRIPTION':
        return 'person_add';
      case 'MENTION':
        return 'alternate_email';
      default:
        return 'notifications';
    }
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
