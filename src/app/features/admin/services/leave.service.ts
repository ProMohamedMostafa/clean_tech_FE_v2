import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { LeaveRepository } from '../repositories/leave.repository';

@Injectable({
  providedIn: 'root',
})
export class LeaveService {
  constructor(private leaveRepo: LeaveRepository) {}

  getAllLeaves(): Observable<any> {
    return this.leaveRepo.getAllLeaves().pipe(map((response) => response));
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
    return this.leaveRepo
      .getLeavesWithPagination(filters)
      .pipe(map((response) => response));
  }

  createLeave(leaveData: any): Observable<any> {
    return this.leaveRepo
      .createLeave(leaveData)
      .pipe(map((response) => response));
  }

  editLeave(leaveData: any): Observable<any> {
    return this.leaveRepo
      .editLeave(leaveData)
      .pipe(map((response) => response));
  }

  deleteLeave(id: number): Observable<any> {
    return this.leaveRepo.deleteLeave(id).pipe(map((response) => response));
  }

  getLeaveById(id: number): Observable<any> {
    return this.leaveRepo.getLeaveById(id).pipe(map((response) => response));
  }

  createLeaveRequest(
    startDate: string,
    endDate: string,
    type: number,
    reason: string,
    file?: File
  ): Observable<any> {
    return this.leaveRepo
      .createLeaveRequest(startDate, endDate, type, reason, file)
      .pipe(map((response) => response));
  }

  editLeaveRequest(
    id: number,
    startDate: string,
    endDate: string,
    type: number,
    reason: string,
    file?: File
  ): Observable<any> {
    return this.leaveRepo
      .editLeaveRequest(id, startDate, endDate, type, reason, file)
      .pipe(map((response) => response));
  }

  approveLeave(id: number): Observable<any> {
    return this.leaveRepo
      .approveOrRejectLeave(id, true)
      .pipe(map((response) => response));
  }

  rejectLeave(id: number, rejectionReason: string): Observable<any> {
    return this.leaveRepo
      .approveOrRejectLeave(id, false, rejectionReason)
      .pipe(map((response) => response));
  }
}
