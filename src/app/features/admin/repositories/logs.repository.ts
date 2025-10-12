import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LogsRepository {
  private baseUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const userData = localStorage.getItem('userData');
    const token = userData ? JSON.parse(userData).token : null;

    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    });
  }

  getLogs(
    pageNumber?: number,
    pageSize?: number,
    search?: string,
    roleId?: number,
    userId?: number,
    startDate?: string,
    endDate?: string,
    action?: number,
    module?: number,
    History: boolean = false
  ): Observable<any> {
    let url = `${this.baseUrl}/logs`;

    const params: string[] = [];
    if (pageNumber) params.push(`PageNumber=${pageNumber}`);
    if (pageSize) params.push(`PageSize=${pageSize}`);
    if (search && search.trim() !== '') params.push(`Search=${search}`);
    if (roleId) params.push(`RoleId=${roleId}`);
    if (userId) params.push(`UserId=${userId}`);
    if (startDate) params.push(`StartDate=${startDate}`);
    if (endDate) params.push(`EndDate=${endDate}`);
    if (action !== undefined) params.push(`Action=${action}`);
    if (module !== undefined) params.push(`Module=${module}`);
    params.push(`History=${History ? 'true' : 'false'}`);

    if (params.length) {
      url += `?${params.join('&')}`;
    }

    return this.http
      .get<any>(url, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getNotifications(IsRead: boolean = false): Observable<any> {
    const url = `${this.baseUrl}/notifications?IsRead=${IsRead}`;
    return this.http
      .get<any>(url, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  markAllNotificationsAsRead(): Observable<any> {
    const url = `${this.baseUrl}/notifications/mark/read`;
    return this.http
      .post<any>(url, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('Repository error:', error);
    throw error;
  }
}
