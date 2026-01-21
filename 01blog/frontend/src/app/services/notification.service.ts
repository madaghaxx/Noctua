import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NotificationResponse, PageResponse } from '../models/social.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly API_URL = 'http://localhost:8080/api/notifications';
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUnreadCount();
  }

  getNotifications(
    page: number = 0,
    size: number = 20
  ): Observable<PageResponse<NotificationResponse>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<PageResponse<NotificationResponse>>(this.API_URL, { params });
  }

  getUnreadCount(): Observable<{ unreadCount: number }> {
    return this.http
      .get<{ unreadCount: number }>(`${this.API_URL}/unread-count`)
      .pipe(tap((response) => this.unreadCountSubject.next(response.unreadCount)));
  }

  markAsRead(notificationId: string): Observable<void> {
    return this.http
      .put<void>(`${this.API_URL}/${notificationId}/read`, {})
      .pipe(tap(() => this.loadUnreadCount()));
  }

  markAllAsRead(): Observable<void> {
    return this.http
      .put<void>(`${this.API_URL}/read-all`, {})
      .pipe(tap(() => this.unreadCountSubject.next(0)));
  }

  private loadUnreadCount(): void {
    this.getUnreadCount().subscribe();
  }

  refreshUnreadCount(): void {
    this.loadUnreadCount();
  }
}
