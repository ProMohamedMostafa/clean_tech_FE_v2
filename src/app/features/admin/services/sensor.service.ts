import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { SensorRepository } from '../repositories/sensor.repository';
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
export class SensorService {
  constructor(private sensorRepo: SensorRepository) {}

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
  ): Observable<ApiResponse<PaginatedDevices> | null> {
    return this.sensorRepo
      .getDevices(
        pageNumber,
        pageSize,
        searchQuery,
        applicationId,
        areaId,
        cityId,
        organizationId,
        buildingId,
        floorId,
        sectionId,
        pointId,
        isActive,
        minBattery,
        maxBattery,
        isAssign
      )
      .pipe(map((response) => response));
  }

  getApplications(): Observable<Application[] | null> {
    return this.sensorRepo
      .getApplications()
      .pipe(map((response) => (response.succeeded ? response.data : null)));
  }

  toggleDevicePoint(payload: ToggleDevicePointPayload): Observable<boolean> {
    return this.sensorRepo.toggleDevicePoint(payload).pipe(map(() => true));
  }

  getDeviceDetails(id: number): Observable<Device | null> {
    return this.sensorRepo
      .getDeviceDetails(id)
      .pipe(map((response) => (response.succeeded ? response.data : null)));
  }

  createDeviceLimit(payload: {
    deviceId: number;
    key: string;
    min: number;
    max: number;
  }): Observable<boolean> {
    return this.sensorRepo.createDeviceLimit(payload).pipe(map(() => true));
  }

  editDeviceLimit(payload: {
    deviceId: number;
    key: string;
    min: number;
    max: number;
  }): Observable<boolean> {
    return this.sensorRepo.editDeviceLimit(payload).pipe(map(() => true));
  }

  deleteDeviceLimit(limitId: number): Observable<boolean> {
    return this.sensorRepo.deleteDeviceLimit(limitId).pipe(map(() => true));
  }

  softDeleteDevice(deviceId: number): Observable<boolean> {
    return this.sensorRepo.softDeleteDevice(deviceId).pipe(map(() => true));
  }

  restoreDevice(deviceId: number): Observable<boolean> {
    return this.sensorRepo.restoreDevice(deviceId).pipe(map(() => true));
  }

  getDeletedDevices(): Observable<Device[] | null> {
    return this.sensorRepo
      .getDeletedDevices()
      .pipe(map((response) => (response.succeeded ? response.data : null)));
  }
  getCompletionTasks(
    sectionId?: number,
    year?: number,
    month?: number
  ): Observable<any | null> {
    return this.sensorRepo
      .getCompletionTasks(sectionId, year, month)
      .pipe(map((response) => (response ? response : null)));
  }
}
