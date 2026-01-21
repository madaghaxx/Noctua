import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Post, CreatePostRequest, UpdatePostRequest, PageResponse } from '../models/post.model';
import { ApiResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private apiUrl = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient) {}

  getPosts(page: number = 0, size: number = 10): Observable<PageResponse<Post>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    return this.http
      .get<ApiResponse<PageResponse<Post>>>(this.apiUrl, { params })
      .pipe(map((response) => response.data));
  }

  getPostById(id: string): Observable<Post> {
    return this.http
      .get<ApiResponse<Post>>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  getUserPosts(
    userId: string,
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<Post>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    return this.http
      .get<ApiResponse<PageResponse<Post>>>(`${this.apiUrl}/user/${userId}`, { params })
      .pipe(map((response) => response.data));
  }

  createPost(post: CreatePostRequest): Observable<Post> {
    return this.http
      .post<ApiResponse<Post>>(this.apiUrl, post)
      .pipe(map((response) => response.data));
  }

  updatePost(id: string, post: UpdatePostRequest): Observable<Post> {
    return this.http
      .put<ApiResponse<Post>>(`${this.apiUrl}/${id}`, post)
      .pipe(map((response) => response.data));
  }

  deletePost(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(map(() => undefined));
  }

  uploadMedia(postId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('files', file);
    return this.http.post(`http://localhost:8080/api/media/upload/${postId}`, formData);
  }

  deleteMedia(postId: string, mediaId: string): Observable<void> {
    return this.http.delete<void>(`http://localhost:8080/api/media/${mediaId}`);
  }
}
