import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  AttendanceHistoryResponse,
  AttendanceStatusCountResponse,
  AttendanceStatusResponse,
} from '../models/attendance.model';
import { AttendanceRepository } from '../repositories/attendance.repository';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  constructor(private attendanceRepo: AttendanceRepository) {}

  // تسجيل الحضور (Clock In/Out)
  clockAttendance(userId: number): Observable<boolean> {
    return this.attendanceRepo.clockAttendance(userId).pipe(
      map(() => true) // نجح الطلب رجع true
    );
  }

  // جلب حالة الحضور لمستخدم معين
  getAttendanceStatus(
    userId: number
  ): Observable<AttendanceStatusResponse | null> {
    return this.attendanceRepo.getAttendanceStatus(userId).pipe(
      map((response) => {
        if (response.succeeded && response.data) {
          return response;
        }
        // لو لم تنجح العملية أو لا توجد بيانات، ترجع null
        return null;
      })
    );
  }

  // جلب سجل الحضور مع الفلاتر والدعم للصفحات
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
  }): Observable<AttendanceHistoryResponse | null> {
    return this.attendanceRepo.getAttendanceHistory(filters).pipe(
      map((response) => {
        if (
          response.succeeded &&
          response.data &&
          response.data.data.length > 0
        ) {
          return response;
        }
        return null; // لو مفيش بيانات أو العملية لم تنجح
      })
    );
  }

  // جلب إحصائيات حالة الحضور حسب اليوم والشهر
  getAttendanceStatusCount(
    day: number,
    month: number
  ): Observable<AttendanceStatusCountResponse | null> {
    return this.attendanceRepo.getAttendanceStatusCount(day, month).pipe(
      map((response) => {
        if (response.succeeded && response.data) {
          return response;
        }
        return null;
      })
    );
  }
}
