import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { ShiftRepository } from '../repositories/shift.repository';
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
export class ShiftService {
  private shiftUpdates = new Subject<void>();

  constructor(private shiftRepo: ShiftRepository) {}

  // Emit update when data changes
  notifyShiftUpdates() {
    this.shiftUpdates.next();
  }

  onShiftUpdates(): Observable<void> {
    return this.shiftUpdates.asObservable();
  }

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
  }): Observable<ApiResponse<Shift> | null> {
    return this.shiftRepo
      .getPaginatedShifts(filters)
      .pipe(map((response) => response));
  }

  createShift(shift: ShiftCreateOrEditRequest): Observable<boolean> {
    return this.shiftRepo.createShift(shift).pipe(
      tap(() => this.notifyShiftUpdates()),
      map(() => true)
    );
  }

  updateShift(shift: ShiftCreateOrEditRequest): Observable<boolean> {
    return this.shiftRepo.updateShift(shift).pipe(
      tap(() => this.notifyShiftUpdates()),
      map(() => true)
    );
  }

  getShiftDetailsById(shiftId: number): Observable<ShiftDetailResponse | null> {
    return this.shiftRepo
      .getShiftDetailsById(shiftId)
      .pipe(map((response) => response));
  }

  deleteShift(id: number): Observable<{ success: boolean; message: string }> {
    return this.shiftRepo.deleteShift(id).pipe(
      tap(() => this.notifyShiftUpdates()),
      map((res: any) => ({
        success: res.succeeded,
        message: res.succeeded
          ? res.message || 'Shift deleted.'
          : res.error || 'Failed to delete shift.',
      }))
    );
  }

  restoreShift(id: number): Observable<boolean> {
    return this.shiftRepo.restoreShift(id).pipe(
      tap(() => this.notifyShiftUpdates()),
      map(() => true)
    );
  }

  forceDeleteShift(id: number): Observable<boolean> {
    return this.shiftRepo.forceDeleteShift(id).pipe(
      tap(() => this.notifyShiftUpdates()),
      map(() => true)
    );
  }

  getDeletedShifts(): Observable<DeletedShiftsResponse | null> {
    return this.shiftRepo.getDeletedShifts().pipe(map((response) => response));
  }

  getActiveShiftsCount(): Observable<number> {
    return this.shiftRepo
      .getActiveShiftsCount()
      .pipe(map((response) => response.data ?? 0));
  }

  getUserShifts(userId: number): Observable<any | null> {
    return this.shiftRepo
      .getUserShifts(userId)
      .pipe(map((response) => response));
  }
}
