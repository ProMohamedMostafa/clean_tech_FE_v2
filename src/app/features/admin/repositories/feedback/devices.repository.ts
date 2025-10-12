import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import {
  DeviceListResponse,
  DeviceResponse,
  Device,
} from '../../models/feedback/device.model';

@Injectable({
  providedIn: 'root',
})
export class DevicesRepository {
  private readonly baseUrl = `${environment.apiUrl}/feedback/devices`;

  constructor(private http: HttpClient) {}

  getDevices(filters: {
    PageNumber?: number;
    PageSize?: number;
    SearchQuery?: string;
    SectionId?: number;
  }): Observable<DeviceListResponse> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    }
    return this.http.get<DeviceListResponse>(this.baseUrl, { params });
  }

  getDeviceById(id: number): Observable<DeviceResponse> {
    return this.http.get<DeviceResponse>(`${this.baseUrl}/${id}`);
  }

  createDevice(payload: {
    name: string;
    sectionId: number;
  }): Observable<DeviceResponse> {
    return this.http.post<DeviceResponse>(`${this.baseUrl}/create`, payload);
  }

  updateDevice(payload: {
    id: number;
    name: string;
    sectionId: number;
  }): Observable<DeviceResponse> {
    return this.http.put<DeviceResponse>(`${this.baseUrl}/edit`, payload);
  }

  deleteDevice(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }
}