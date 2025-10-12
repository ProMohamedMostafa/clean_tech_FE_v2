import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LeaveRepository {
  private readonly baseUrl = `${environment.apiUrl}/leaves`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const userData = localStorage.getItem('userData');
    const token = userData ? JSON.parse(userData).token : '';

    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  getAllLeaves(): Observable<any> {
    return this.http.get(`${this.baseUrl}`, { headers: this.getHeaders() });
  }

  getLeavesWithPagination(filters: {
    PageNumber?: number;
    PageSize?: number;
    Search?: string;
    UserId?: number;
    StartDate?: string;
    EndDate?: string;
    History?: boolean;
    RoleId?: string;
    ProviderId?: string;
    Type?: number;
    Status?: number;
    AreaId?: number;
    CityId?: number;
    OrganizationId?: number;
    BuildingId?: number;
    FloorId?: number;
    SectionId?: number;
    PointId?: number;
  }): Observable<any> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== null && value !== undefined) {
        params = params.set(key, value.toString());
      }
    }
    return this.http.get(`${this.baseUrl}/pagination`, {
      params,
      headers: this.getHeaders(),
    });
  }

  createLeave(leaveData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/create`, leaveData, {
      headers: this.getHeaders(),
    });
  }

  editLeave(leaveData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/edit`, leaveData, {
      headers: this.getHeaders(),
    });
  }

  deleteLeave(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`, {
      headers: this.getHeaders(),
    });
  }

  getLeaveById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  createLeaveRequest(
    startDate: string,
    endDate: string,
    type: number,
    reason: string,
    file?: File
  ): Observable<any> {
    const formData = new FormData();
    formData.append('StartDate', startDate);
    formData.append('EndDate', endDate);
    formData.append('Type', type.toString());
    formData.append('Reason', reason);
    if (file) {
      formData.append('File', file);
    }

    return this.http.post(`${this.baseUrl}/create/request`, formData, {
      headers: this.getHeaders(),
    });
  }

  editLeaveRequest(
    id: number,
    startDate: string,
    endDate: string,
    type: number,
    reason: string,
    file?: File
  ): Observable<any> {
    const formData = new FormData();
    formData.append('Id', id.toString());
    formData.append('StartDate', startDate);
    formData.append('EndDate', endDate);
    formData.append('Type', type.toString());
    formData.append('Reason', reason);
    if (file) {
      formData.append('File', file);
    }

    return this.http.put(`${this.baseUrl}/edit/request`, formData, {
      headers: this.getHeaders(),
    });
  }

  approveOrRejectLeave(
    id: number,
    isApproved: boolean,
    rejectionReason: string = ''
  ): Observable<any> {
    const payload = {
      id,
      isApproved,
      rejectionReason,
    };

    const headers = this.getHeaders().set('Content-Type', 'application/json');

    return this.http.put(`${this.baseUrl}/approve-or-reject`, payload, {
      headers,
    });
  }
}
