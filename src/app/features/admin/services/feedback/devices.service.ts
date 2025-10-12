import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import {
  Device,
  DeviceListResponse,
  DeviceResponse,
} from '../../models/feedback/device.model';
import { DevicesRepository } from '../../repositories/feedback/devices.repository';

@Injectable({
  providedIn: 'root',
})
export class DevicesService {
  constructor(private devicesRepo: DevicesRepository) {}

  getDevices(filters: {
    PageNumber?: number;
    PageSize?: number;
    SearchQuery?: string;
    SectionId?: number;
  }): Observable<DeviceListResponse | null> {
    return this.devicesRepo.getDevices(filters).pipe(
      map((response) => {
        return response;
      })
    );
  }

  getDeviceById(id: number): Observable<Device | null> {
    return this.devicesRepo.getDeviceById(id).pipe(
      map((response) => {
        if (response.succeeded && response.data) {
          return response.data;
        }
        return null;
      })
    );
  }

  createDevice(payload: {
    name: string;
    sectionId: number;
  }): Observable<DeviceResponse | null> {
    return this.devicesRepo.createDevice(payload).pipe(
      map((response) => {
        return response;
      })
    );
  }

  updateDevice(payload: {
    id: number;
    name: string;
    sectionId: number;
  }): Observable<DeviceResponse> {
    return this.devicesRepo.updateDevice(payload);
  }

  deleteDevice(id: number): Observable<boolean> {
    return this.devicesRepo.deleteDevice(id).pipe(map(() => true));
  }
}
