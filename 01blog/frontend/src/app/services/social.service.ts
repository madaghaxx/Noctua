import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  LikeStatusResponse,
  CommentRequest,
  CommentResponse,
  PageResponse,
} from '../models/social.model';

@Injectable({
  providedIn: 'root',
})
export class SocialService {
  private readonly API_URL = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Like operations
  toggleLike(postId: string): Observable<LikeStatusResponse> {
    return this.http.post<LikeStatusResponse>(`${this.API_URL}/posts/${postId}/likes`, {});
  }

  getLikeStatus(postId: string): Observable<LikeStatusResponse> {
    return this.http.get<LikeStatusResponse>(`${this.API_URL}/posts/${postId}/likes/status`);
  }

  // Comment operations
  createComment(postId: string, request: CommentRequest): Observable<CommentResponse> {
    return this.http.post<CommentResponse>(`${this.API_URL}/posts/${postId}/comments`, request);
  }

  getComments(
    postId: string,
    page: number = 0,
    size: number = 20
  ): Observable<PageResponse<CommentResponse>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<PageResponse<CommentResponse>>(
      `${this.API_URL}/posts/${postId}/comments`,
      { params }
    );
  }

  updateComment(
    postId: string,
    commentId: string,
    request: CommentRequest
  ): Observable<CommentResponse> {
    return this.http.put<CommentResponse>(
      `${this.API_URL}/posts/${postId}/comments/${commentId}`,
      request
    );
  }

  deleteComment(postId: string, commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/posts/${postId}/comments/${commentId}`);
  }
}
