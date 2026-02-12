import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User, ApiResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(this.apiUrl).pipe(map((response) => response.data));
  }

  getUserById(id: string): Observable<User> {
    return this.http
      .get<ApiResponse<User>>(`${this.apiUrl}/id/${id}`)
      .pipe(map((response) => response.data));
  }

  getCurrentUser(): Observable<User> {
    return this.http
      .get<ApiResponse<User>>(`${this.apiUrl}/me`)
      .pipe(map((response) => response.data));
  }
}
