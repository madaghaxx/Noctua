import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';

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
  hidden: boolean;
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

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly API_URL = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  // Analytics
  getAnalytics(): Observable<ApiResponse<Analytics>> {
    return this.http.get<ApiResponse<Analytics>>(`${this.API_URL}/analytics`);
  }

  // User Management
  getUsers(page = 0, size = 20): Observable<ApiResponse<PageResponse<UserAdmin>>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<ApiResponse<PageResponse<UserAdmin>>>(`${this.API_URL}/users`, { params });
  }

  banUser(userId: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/users/${userId}/ban`, {});
  }

  unbanUser(userId: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/users/${userId}/unban`, {});
  }

  deleteUser(userId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/users/${userId}`);
  }

  // Post Moderation
  getPosts(page = 0, size = 20): Observable<ApiResponse<PageResponse<PostAdmin>>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<ApiResponse<PageResponse<PostAdmin>>>(`${this.API_URL}/posts`, { params });
  }

  deletePost(postId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/posts/${postId}`);
  }

  hidePost(postId: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/posts/${postId}/hide`, {});
  }

  unhidePost(postId: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/posts/${postId}/unhide`, {});
  }

  // Report Management
  getPendingReports(): Observable<ApiResponse<Report[]>> {
    return this.http.get<ApiResponse<Report[]>>(`${this.API_URL}/reports/pending`);
  }

  getAllReports(): Observable<ApiResponse<Report[]>> {
    return this.http.get<ApiResponse<Report[]>>(`${this.API_URL}/reports`);
  }

  resolveReport(reportId: string, adminNote: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/reports/${reportId}/resolve`, {
      adminNote,
    });
  }

  dismissReport(reportId: string, adminNote: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/reports/${reportId}/dismiss`, {
      adminNote,
    });
  }
}
