import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ApiResponse,
  DeletedShiftsResponse,
  Shift,
  ShiftCreateOrEditRequest,
  ShiftDetailResponse,
} from '../models/shift.model';

@Injectable({
  providedIn: 'root',
})
export class ShiftRepository {
  private readonly baseUrl = `${environment.apiUrl}/shifts`;

  constructor(private http: HttpClient) {}

  getPaginatedShifts(filters: {
    pageNumber: number;
    pageSize?: number;
    search?: string;
    areaId?: number;
    cityId?: number;
    organizationId?: number;
    buildingId?: number;
    floorId?: number;
    sectionId?: number;
    pointId?: number;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
  }): Observable<ApiResponse<Shift>> {
    let params = new HttpParams().set(
      'pageNumber',
      filters.pageNumber.toString()
    );

    if (filters.pageSize)
      params = params.set('pageSize', filters.pageSize.toString());
    if (filters.search) params = params.set('search', filters.search);

    if (filters.areaId != null)
      params = params.set('areaId', filters.areaId.toString());
    if (filters.cityId != null)
      params = params.set('cityId', filters.cityId.toString());
    if (filters.organizationId != null)
      params = params.set('organizationId', filters.organizationId.toString());
    if (filters.buildingId != null)
      params = params.set('buildingId', filters.buildingId.toString());
    if (filters.floorId != null)
      params = params.set('floorId', filters.floorId.toString());
    if (filters.sectionId != null)
      params = params.set('sectionId', filters.sectionId.toString());
    if (filters.pointId != null)
      params = params.set('pointId', filters.pointId.toString());

    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);
    if (filters.startTime) params = params.set('startTime', filters.startTime);
    if (filters.endTime) params = params.set('endTime', filters.endTime);

    return this.http.get<ApiResponse<Shift>>(`${this.baseUrl}/pagination`, {
      params,
    });
  }

  createShift(
    shift: ShiftCreateOrEditRequest
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/create`, shift);
  }

  updateShift(
    shift: ShiftCreateOrEditRequest
  ): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/edit`, shift);
  }

  getShiftDetailsById(shiftId: number): Observable<ShiftDetailResponse> {
    return this.http.get<ShiftDetailResponse>(`${this.baseUrl}/${shiftId}`);
  }

  deleteShift(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/delete/${id}`,
      {}
    );
  }

  restoreShift(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/restore/${id}`, null);
  }

  forceDeleteShift(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/forcedelete/${id}`);
  }

  getDeletedShifts(): Observable<DeletedShiftsResponse> {
    return this.http.get<DeletedShiftsResponse>(
      `${this.baseUrl}/deleted/index`
    );
  }

  getActiveShiftsCount(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/active/count`);
  }

  getUserShifts(userId: number): Observable<any> {
    const url = `${environment.apiUrl}/user/shift/${userId}`;
    return this.http.get<any>(url);
  }
}
