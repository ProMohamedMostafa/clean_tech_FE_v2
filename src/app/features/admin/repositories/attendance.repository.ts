import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AttendanceHistoryResponse,
  AttendanceStatusCountResponse,
  AttendanceStatusResponse,
} from '../models/attendance.model';

@Injectable({
  providedIn: 'root',
})
export class AttendanceRepository {
  private readonly baseUrl = `${environment.apiUrl}/attendance`;

  constructor(private http: HttpClient) {}

  // POST clock attendance
  clockAttendance(userId: number): Observable<any> {
    let params = new HttpParams().set('userId', userId.toString());
    return this.http.post(`${this.baseUrl}/clock`, null, { params });
  }

  // GET attendance status by userId
  getAttendanceStatus(userId: number): Observable<AttendanceStatusResponse> {
    let params = new HttpParams().set('userId', userId.toString());
    return this.http.get<AttendanceStatusResponse>(`${this.baseUrl}/status`, {
      params,
    });
  }

  // GET attendance history with filters and pagination
  getAttendanceHistory(filters: {
    PageNumber?: number;
    PageSize?: number;
    Search?: string;
    UserId?: number;
    StartDate?: string;
    EndDate?: string;
    Status?: number;
    RoleId?: number;
    History?: boolean;
    Shift?: number;
    AreaId?: number;
    CityId?: number;
    OrganizationId?: number;
    BuildingId?: number;
    FloorId?: number;
    SectionId?: number;
    PointId?: number;
    ProviderId?: number;
  }): Observable<AttendanceHistoryResponse> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    }
    return this.http.get<AttendanceHistoryResponse>(`${this.baseUrl}/history`, {
      params,
    });
  }

  // GET attendance status count by day and month
  getAttendanceStatusCount(
    day: number,
    month: number
  ): Observable<AttendanceStatusCountResponse> {
    let params = new HttpParams()
      .set('Day', day.toString())
      .set('Month', month.toString());
    return this.http.get<AttendanceStatusCountResponse>(
      `${this.baseUrl}/status/count`,
      { params }
    );
  }
}
