import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { SharedHeaderComponent } from '../shared-header/shared-header';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';

interface Analytics {
  totalUsers: number;
  totalPosts: number;
  totalReports: number;
  pendingReports: number;
}

interface UserAdmin {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  postCount: number;
  likeCount: number;
  commentCount: number;
}

interface PostAdmin {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  owner: {
    id: string;
    username: string;
    avatar?: string;
  };
  mediaUrls: string[];
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  reported: boolean;
  reportCount: number;
}

interface Report {
  id: string;
  reporter: {
    id: string;
    username: string;
    avatar?: string;
  };
  reportedUser: {
    id: string;
    username: string;
    avatar?: string;
  };
  reportedPostId?: string;
  reason: string;
  status: string;
  createdAt: string;
  resolvedAt?: string;
  adminNote?: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    MatSnackBarModule,
    MatMenuModule,
    MatChipsModule,
    SharedHeaderComponent,
  ],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss'],
})
export class AdminDashboardComponent implements OnInit {
  analytics = signal<Analytics | null>(null);
  users = signal<UserAdmin[]>([]);
  posts = signal<PostAdmin[]>([]);
  reports = signal<Report[]>([]);
  pendingReports = signal<Report[]>([]);

  // Pagination
  usersPage = signal(0);
  usersSize = signal(20);
  usersTotal = signal(0);

  postsPage = signal(0);
  postsSize = signal(20);
  postsTotal = signal(0);

  loading = signal(false);

  // Table columns
  userColumns = ['avatar', 'username', 'email', 'role', 'status', 'stats', 'actions'];
  postColumns = ['title', 'owner', 'stats', 'reports', 'actions'];
  reportColumns = ['reporter', 'reportedUser', 'reason', 'status', 'actions'];

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAnalytics();
    this.loadUsers();
    this.loadPosts();
    this.loadReports();
  }

  loadAnalytics() {
    this.adminService.getAnalytics().subscribe({
      next: (response) => {
        if (response.success) {
          this.analytics.set(response.data);
        }
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
        this.snackBar.open('Failed to load analytics', 'Close', { duration: 3000 });
      },
    });
  }

  loadUsers(page = 0) {
    this.loading.set(true);
    this.adminService.getUsers(page, this.usersSize()).subscribe({
      next: (response) => {
        if (response.success) {
          this.users.set(response.data.content);
          this.usersTotal.set(response.data.totalElements);
          this.usersPage.set(page);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
        this.loading.set(false);
      },
    });
  }

  loadPosts(page = 0) {
    this.loading.set(true);
    this.adminService.getPosts(page, this.postsSize()).subscribe({
      next: (response) => {
        if (response.success) {
          this.posts.set(response.data.content);
          this.postsTotal.set(response.data.totalElements);
          this.postsPage.set(page);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.snackBar.open('Failed to load posts', 'Close', { duration: 3000 });
        this.loading.set(false);
      },
    });
  }

  loadReports() {
    this.adminService.getAllReports().subscribe({
      next: (response) => {
        if (response.success) {
          this.reports.set(response.data);
        }
      },
      error: (error) => {
        console.error('Error loading reports:', error);
        this.snackBar.open('Failed to load reports', 'Close', { duration: 3000 });
      },
    });

    this.adminService.getPendingReports().subscribe({
      next: (response) => {
        if (response.success) {
          this.pendingReports.set(response.data);
        }
      },
      error: (error) => {
        console.error('Error loading pending reports:', error);
      },
    });
  }

  onUsersPageChange(event: PageEvent) {
    this.loadUsers(event.pageIndex);
  }

  onPostsPageChange(event: PageEvent) {
    this.loadPosts(event.pageIndex);
  }

  banUser(userId: string) {
    this.openConfirmDialog(
      {
        title: 'Ban user',
        message: 'Are you sure you want to ban this user?',
        confirmText: 'Ban',
        cancelText: 'Cancel',
      },
      () => {
        this.adminService.banUser(userId).subscribe({
          next: (response) => {
            if (response.success) {
              this.snackBar.open('User banned successfully', 'Close', { duration: 3000 });
              this.loadUsers(this.usersPage());
            }
          },
          error: (error) => {
            console.error('Error banning user:', error);
            this.snackBar.open('Failed to ban user', 'Close', { duration: 3000 });
          },
        });
      }
    );
  }

  unbanUser(userId: string) {
    this.openConfirmDialog(
      {
        title: 'Unban user',
        message: 'Are you sure you want to unban this user?',
        confirmText: 'Unban',
        cancelText: 'Cancel',
      },
      () => {
        this.adminService.unbanUser(userId).subscribe({
          next: (response) => {
            if (response.success) {
              this.snackBar.open('User unbanned successfully', 'Close', { duration: 3000 });
              this.loadUsers(this.usersPage());
            }
          },
          error: (error) => {
            console.error('Error unbanning user:', error);
            this.snackBar.open('Failed to unban user', 'Close', { duration: 3000 });
          },
        });
      }
    );
  }

  deleteUser(userId: string) {
    this.openConfirmDialog(
      {
        title: 'Delete user',
        message:
          'Are you sure you want to permanently delete this user and all their content? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
      () => {
        this.adminService.deleteUser(userId).subscribe({
          next: (response) => {
            if (response.success) {
              this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
              this.loadUsers(this.usersPage());
              this.loadAnalytics();
            }
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            this.snackBar.open('Failed to delete user', 'Close', { duration: 3000 });
          },
        });
      }
    );
  }

  deletePost(postId: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Delete post',
        message: 'Are you sure you want to delete this post? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.adminService.deletePost(postId).subscribe({
          next: (response) => {
            if (response.success) {
              this.snackBar.open('Post deleted successfully', 'Close', { duration: 3000 });
              this.loadPosts(this.postsPage());
              this.loadAnalytics();
            }
          },
          error: (error) => {
            console.error('Error deleting post:', error);
            this.snackBar.open('Failed to delete post', 'Close', { duration: 3000 });
          },
        });
      }
    });
  }

  deleteReportedPost(report: Report) {
    if (!report.reportedPostId) {
      this.snackBar.open('No reported post attached to this report', 'Close', {
        duration: 3000,
      });
      return;
    }

    const postId = report.reportedPostId;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Delete reported post',
        message: 'Delete the reported post? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.adminService.deletePost(postId).subscribe({
          next: (response) => {
            if (response.success) {
              this.adminService.resolveReport(report.id, 'Post deleted by admin').subscribe(() => {
                this.snackBar.open('Post deleted and report resolved', 'Close', { duration: 3000 });
                this.loadReports();
                this.loadPosts(this.postsPage());
                this.loadAnalytics();
              });
            }
          },
          error: (error) => {
            console.error('Error deleting reported post:', error);
            this.snackBar.open('Failed to delete reported post', 'Close', { duration: 3000 });
          },
        });
      }
    });
  }

  showReportedPost(report: Report) {
    if (!report.reportedPostId) {
      this.snackBar.open('No reported post attached to this report', 'Close', {
        duration: 3000,
      });
      return;
    }

    this.router.navigate(['/post', report.reportedPostId]);
  }

  blockReportedUser(report: Report) {
    this.openConfirmDialog(
      {
        title: 'Block user',
        message: 'Block the reported user?',
        confirmText: 'Block',
        cancelText: 'Cancel',
      },
      () => {
        this.adminService.banUser(report.reportedUser.id).subscribe({
          next: (response) => {
            if (response.success) {
              this.adminService.resolveReport(report.id, 'User blocked by admin').subscribe(() => {
                this.snackBar.open('User blocked and report resolved', 'Close', { duration: 3000 });
                this.loadReports();
                this.loadUsers(this.usersPage());
                this.loadAnalytics();
              });
            }
          },
          error: (error) => {
            console.error('Error blocking user:', error);
            this.snackBar.open('Failed to block user', 'Close', { duration: 3000 });
          },
        });
      }
    );
  }

  dismissReport(reportId: string) {
    this.openConfirmDialog(
      {
        title: 'Dismiss report',
        message: 'Dismiss this report?',
        confirmText: 'Dismiss',
        cancelText: 'Cancel',
      },
      () => {
        this.adminService.dismissReport(reportId, '').subscribe({
          next: (response) => {
            if (response.success) {
              this.snackBar.open('Report dismissed successfully', 'Close', { duration: 3000 });
              this.loadReports();
            }
          },
          error: (error) => {
            console.error('Error dismissing report:', error);
            this.snackBar.open('Failed to dismiss report', 'Close', { duration: 3000 });
          },
        });
      }
    );
  }

  private openConfirmDialog(
    data: { title?: string; message: string; confirmText?: string; cancelText?: string },
    onConfirm: () => void
  ) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        onConfirm();
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'primary';
      case 'BANNED':
        return 'warn';
      default:
        return '';
    }
  }

  getReportStatusColor(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'warn';
      case 'RESOLVED':
        return 'primary';
      case 'DISMISSED':
        return 'accent';
      default:
        return '';
    }
  }
}
