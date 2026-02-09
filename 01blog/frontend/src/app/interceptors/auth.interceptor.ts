import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401 || error.status === 403) {
        // Token expired, invalid, or access denied
        authService.logout('Your session has expired or access is denied. Please log in again.');
      } else if (
        error.status === 404 &&
        (req.url.includes('/api/users/id/') || req.url.endsWith('/api/users/me'))
      ) {
        // User no longer exists (e.g., DB reset)
        authService.logout('Your account was not found. Please log in again.');
      }
      return throwError(() => error);
    })
  );
};
