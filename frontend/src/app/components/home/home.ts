import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';
import { AuthResponse } from '../../models/auth.model';
import { NotificationBellComponent } from '../notification-bell/notification-bell';
import { PostFeedComponent } from '../post-feed/post-feed';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    NotificationBellComponent,
    PostFeedComponent,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  currentUser: AuthResponse | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout();
  }

  goToProfile(): void {
    if (this.currentUser?.id) {
      this.router.navigate(['/profile', this.currentUser.id]);
    }
  }

  goToSubscriptions(): void {
    this.router.navigate(['/subscriptions']);
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
