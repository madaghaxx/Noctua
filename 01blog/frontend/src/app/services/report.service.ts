import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateReportRequest {
  reportedUserId: string;
  reason: string;
  details?: string;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private apiUrl = 'http://localhost:8080/api/reports';

  constructor(private http: HttpClient) {}

  createReport(request: CreateReportRequest): Observable<any> {
    return this.http.post(this.apiUrl, request);
  }
}
