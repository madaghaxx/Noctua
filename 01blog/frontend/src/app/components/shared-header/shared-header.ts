import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';
import { AuthResponse } from '../../models/auth.model';
import { NotificationBellComponent } from '../notification-bell/notification-bell';

@Component({
  selector: 'app-shared-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatMenuModule,
    MatDividerModule,
    NotificationBellComponent,
  ],
  templateUrl: './shared-header.html',
  styleUrl: './shared-header.scss',
})
export class SharedHeaderComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser: AuthResponse | null = null;

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  goToProfile(): void {
    const userId = this.currentUser?.id;
    if (userId) {
      this.router.navigate(['/profile', userId]);
    }
  }

  goToSubscriptions(): void {
    this.router.navigate(['/subscriptions']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
