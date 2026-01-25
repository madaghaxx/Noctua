import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { NotificationResponse } from '../../models/social.model';
import { SharedHeaderComponent } from '../shared-header/shared-header';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    SharedHeaderComponent,
    TimeAgoPipe,
  ],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class NotificationsComponent implements OnInit {
  notifications: NotificationResponse[] = [];
  loading = false;
  currentPage = 0;
  pageSize = 20;
  hasMore = true;
  totalPages = 0;

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  get hasUnreadNotifications(): boolean {
    return this.notifications.length > 0 && this.notifications.some((n) => !n.isRead);
  }

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    if (this.loading || (!this.hasMore && this.currentPage > 0)) return;

    this.loading = true;
    this.notificationService.getNotifications(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        setTimeout(() => {
          if (this.currentPage === 0) {
            this.notifications = response.content;
          } else {
            this.notifications = [...this.notifications, ...response.content];
          }
          this.hasMore = this.currentPage < response.totalPages;
          this.totalPages = response.totalPages;
          this.currentPage++;
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
      notification.isRead = true;
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

  loadMore(): void {
    this.loadNotifications();
  }

  trackByNotificationId(index: number, notification: NotificationResponse): string {
    return notification.id;
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
}
