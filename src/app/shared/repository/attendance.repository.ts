import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AttendanceRepository {
  private readonly baseUrl = `${environment.apiUrl}/attendance`;

  constructor(private http: HttpClient) {}

  // ✅ 1. Clock in/out for a user
  clock(): Observable<any> {
    const url = `${this.baseUrl}/clock`;
    const params = new HttpParams();
    return this.http.post<any>(url, null, { params });
  }

  // ✅ 2. Get current attendance status for a user
  getAttendanceStatus(): Observable<any> {
    const url = `${this.baseUrl}/status`;
    const params = new HttpParams();
    return this.http.get<any>(url, { params });
  }

  // ✅ 3. Get attendance history with filters
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
  }): Observable<any> {
    const url = `${this.baseUrl}/history`;
    let params = new HttpParams();

    for (const [key, value] of Object.entries(filters)) {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    }

    return this.http.get<any>(url, { params });
  }

  // ✅ 4. Get status count (Present, Absent, Leaves) by day & month
  getStatusCount(day: number, month: number): Observable<any> {
    const url = `${this.baseUrl}/status/count`;
    const params = new HttpParams()
      .set('Day', day.toString())
      .set('Month', month.toString());

    return this.http.get<any>(url, { params });
  }
}
