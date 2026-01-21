import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Home } from './components/home/home';
import { UserProfileComponent } from './components/user-profile/user-profile';
import { SubscriptionsPageComponent } from './components/subscriptions-page/subscriptions-page';
import { PostDetailComponent } from './components/post-detail/post-detail';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'home', component: Home, canActivate: [authGuard] },
  { path: 'post/:id', component: PostDetailComponent, canActivate: [authGuard] },
  { path: 'profile/:id', component: UserProfileComponent, canActivate: [authGuard] },
  { path: 'subscriptions', component: SubscriptionsPageComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/home' },
];
