import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  SubscriptionStatusResponse,
  SubscriptionResponse,
  PageResponse,
} from '../models/social.model';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private readonly API_URL = 'http://localhost:8080/api/subscriptions';

  constructor(private http: HttpClient) {}

  toggleSubscription(userId: string): Observable<SubscriptionStatusResponse> {
    return this.http.post<SubscriptionStatusResponse>(`${this.API_URL}/${userId}`, {});
  }

  getSubscriptionStatus(userId: string): Observable<SubscriptionStatusResponse> {
    return this.http.get<SubscriptionStatusResponse>(`${this.API_URL}/${userId}/status`);
  }

  getSubscriptions(
    userId: string,
    page: number = 0,
    size: number = 20
  ): Observable<PageResponse<SubscriptionResponse>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<PageResponse<SubscriptionResponse>>(
      `${this.API_URL}/${userId}/subscriptions`,
      { params }
    );
  }

  getSubscribers(
    userId: string,
    page: number = 0,
    size: number = 20
  ): Observable<PageResponse<SubscriptionResponse>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<PageResponse<SubscriptionResponse>>(
      `${this.API_URL}/${userId}/subscribers`,
      { params }
    );
  }
}
