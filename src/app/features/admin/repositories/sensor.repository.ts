import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  ApiResponse,
  Application,
  Device,
  PaginatedDevices,
  ToggleDevicePointPayload,
} from '../models/sensor.model';

@Injectable({
  providedIn: 'root',
})
export class SensorRepository {
  private readonly baseUrl = `${environment.apiUrl}/devices`;

  constructor(private http: HttpClient) {}

  // Method to get authentication headers
  private getHeaders(): HttpHeaders {
    const token = JSON.parse(localStorage.getItem('userData') || '{}').token;
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  getDevices(
    pageNumber: number = 1,
    pageSize?: number | null,
    searchQuery?: string,
    applicationId?: number,
    areaId?: number,
    cityId?: number,
    organizationId?: number,
    buildingId?: number,
    floorId?: number,
    sectionId?: number,
    pointId?: number,
    isActive?: boolean | undefined,
    minBattery?: number,
    maxBattery?: number,
    isAssign?: boolean | null
  ): Observable<ApiResponse<PaginatedDevices>> {
    let params = new HttpParams().set('PageNumber', pageNumber.toString());

    if (pageSize) params = params.set('PageSize', pageSize.toString());
    if (searchQuery) params = params.set('SearchQuery', searchQuery);
    if (applicationId)
      params = params.set('ApplicationId', applicationId.toString());
    if (areaId) params = params.set('AreaId', areaId.toString());
    if (cityId) params = params.set('CityId', cityId.toString());
    if (organizationId)
      params = params.set('OrganizationId', organizationId.toString());
    if (buildingId) params = params.set('BuildingId', buildingId.toString());
    if (floorId) params = params.set('FloorId', floorId.toString());
    if (sectionId) params = params.set('SectionId', sectionId.toString());
    if (pointId) params = params.set('PointId', pointId.toString());
    if (isActive !== undefined)
      params = params.set('IsActive', isActive.toString());
    if (minBattery !== undefined)
      params = params.set('MinBattery', minBattery.toString());
    if (maxBattery !== undefined)
      params = params.set('MaxBattery', maxBattery.toString());
    if (isAssign !== null && isAssign !== undefined)
      params = params.set('IsAsign', isAssign.toString());

    return this.http.get<ApiResponse<PaginatedDevices>>(this.baseUrl, {
      headers: this.getHeaders(),
      params,
    });
  }

  getApplications(): Observable<ApiResponse<Application[]>> {
    return this.http.get<ApiResponse<Application[]>>(
      `${this.baseUrl}/applications`,
      { headers: this.getHeaders() }
    );
  }

  toggleDevicePoint(payload: ToggleDevicePointPayload): Observable<any> {
    const url = `${environment.apiUrl}/devices/edit`;
    return this.http.put<any>(url, payload, {
      headers: this.getHeaders(),
    });
  }

  getDeviceDetails(id: number): Observable<ApiResponse<Device>> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.get<ApiResponse<Device>>(url, {
      headers: this.getHeaders(),
    });
  }

  createDeviceLimit(payload: {
    deviceId: number;
    key: string;
    min: number;
    max: number;
  }): Observable<any> {
    const url = `${environment.apiUrl}/devices/limits/create`;
    return this.http.post<any>(url, payload, {
      headers: this.getHeaders(),
    });
  }

  editDeviceLimit(payload: {
    deviceId: number;
    key: string;
    min: number;
    max: number;
  }): Observable<any> {
    const url = `${environment.apiUrl}/devices/limits/edit`;
    return this.http.put<any>(url, payload, {
      headers: this.getHeaders(),
    });
  }

  deleteDeviceLimit(limitId: number): Observable<any> {
    const url = `${environment.apiUrl}/devices/limits/delete/${limitId}`;
    return this.http.delete<any>(url, {
      headers: this.getHeaders(),
    });
  }

  softDeleteDevice(deviceId: number): Observable<any> {
    const url = `${this.baseUrl}/delete/${deviceId}`;
    return this.http.post<any>(url, {}, { headers: this.getHeaders() });
  }

  restoreDevice(deviceId: number): Observable<any> {
    const url = `${this.baseUrl}/restore/${deviceId}`;
    return this.http.post<any>(url, {}, { headers: this.getHeaders() });
  }

  getDeletedDevices(): Observable<ApiResponse<Device[]>> {
    const url = `${environment.apiUrl}/devices/deleted/index`;
    return this.http.get<ApiResponse<Device[]>>(url, {
      headers: this.getHeaders(),
    });
  }

  getCompletionTasks(
    sectionId?: number,
    year?: number,
    month?: number
  ): Observable<any> {
    const url = `${environment.apiUrl}/devices/completion/tasks`;
    let params = new HttpParams();

    if (sectionId !== undefined) {
      params = params.set('SectionId', sectionId.toString());
    }
    if (year !== undefined) {
      params = params.set('Year', year.toString());
    }
    if (month !== undefined) {
      params = params.set('Month', month.toString());
    }

    return this.http.get<any>(url, {
      headers: this.getHeaders(),
      params,
    });
  }
}
