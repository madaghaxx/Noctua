import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register').then((m) => m.Register),
  },
  {
    path: 'home',
    loadComponent: () => import('./components/home/home').then((m) => m.Home),
    canActivate: [authGuard],
  },
  {
    path: 'post/:id',
    loadComponent: () =>
      import('./components/post-detail/post-detail').then((m) => m.PostDetailComponent),
    canActivate: [authGuard],
  },
  {
    path: 'profile/:id',
    loadComponent: () =>
      import('./components/user-profile/user-profile').then((m) => m.UserProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'subscriptions',
    loadComponent: () =>
      import('./components/subscriptions-page/subscriptions-page').then(
        (m) => m.SubscriptionsPageComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./components/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboardComponent),
    canActivate: [adminGuard],
  },
  { path: '**', redirectTo: '/home' },
];
