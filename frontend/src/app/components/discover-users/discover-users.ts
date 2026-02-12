import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { SharedHeaderComponent } from '../shared-header/shared-header';
import { AuthService } from '../../services/auth.service';
import { SubscriptionService } from '../../services/subscription.service';
import { UserService } from '../../services/user';
import { User } from '../../models/auth.model';

@Component({
  selector: 'app-discover-users',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    SharedHeaderComponent,
  ],
  templateUrl: './discover-users.html',
  styleUrl: './discover-users.scss',
})
export class DiscoverUsers implements OnInit {
  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  searchQuery = '';
  loading = signal(false);
  currentUserId: string | null = null;
  subscriptionStatus = signal<{ [userId: string]: boolean }>({});

  constructor(
    private authService: AuthService,
    private subscriptionService: SubscriptionService,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers(); // Load users immediately
    this.authService.currentUser$.subscribe((user) => {
      this.currentUserId = user?.id || null;
      // Re-filter to exclude current user if now available
      if (this.currentUserId) {
        this.filteredUsers.set(this.users().filter((u: User) => u.id !== this.currentUserId));
      }
    });
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.getAllUsers().subscribe({
      next: (users: User[]) => {
        const filtered = this.currentUserId
          ? users.filter((user: User) => user.id !== this.currentUserId)
          : users; // Exclude current user if available
        this.users.set(filtered);
        this.filteredUsers.set([...filtered]);
        this.loading.set(false);
        // Fetch subscription status for each user, but don't block user list rendering
        setTimeout(() => {
          this.users().forEach((user) => {
            this.subscriptionService.getSubscriptionStatus(user.id).subscribe({
              next: (status) => {
                this.subscriptionStatus.update((current) => ({
                  ...current,
                  [user.id]: status.subscribed,
                }));
              },
              error: () => {
                this.subscriptionStatus.update((current) => ({
                  ...current,
                  [user.id]: false,
                }));
              },
            });
          });
        }, 0);
      },
      error: (error: any) => {
        this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
        this.loading.set(false);
      },
    });
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredUsers.set([...this.users()]);
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredUsers.set(
        this.users().filter(
          (user) =>
            user.username.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
        )
      );
    }
  }

  viewProfile(userId: string): void {
    this.router.navigate(['/profile', userId]);
  }

  toggleSubscription(user: User): void {
    if (!this.currentUserId || this.isCurrentUser(user.id)) {
      return;
    }

    const isSubscribed = this.subscriptionStatus()[user.id];
    const action = isSubscribed ? 'unfollow' : 'follow';

    this.subscriptionService.toggleSubscription(user.id).subscribe({
      next: (response: any) => {
        this.subscriptionStatus.update((current) => ({
          ...current,
          [user.id]: !isSubscribed,
        }));
        this.snackBar.open(`Successfully ${action}ed ${user.username}`, 'Close', {
          duration: 3000,
        });
      },
      error: (error: any) => {
        this.snackBar.open(`Failed to ${action} user`, 'Close', { duration: 3000 });
      },
    });
  }

  isCurrentUser(userId: string): boolean {
    return this.currentUserId === userId;
  }

  isSubscribedTo(userId: string): boolean {
    return !!this.subscriptionStatus()[userId];
  }
}
