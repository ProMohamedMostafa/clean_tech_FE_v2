import { Injectable } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';
import { AttendanceRepository } from '../repository/attendance.repository';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  constructor(private attendanceRepo: AttendanceRepository) {}

  // 🔄 Clock In/Out with optional transformation or UI hook
  clockUser(): Observable<{ success: boolean; message: string }> {
    return this.attendanceRepo.clock().pipe(
      map((res) => {
        if (res?.succeeded) {
          return {
            success: true,
            message: res.message || 'Clocked successfully',
          };
        }
        return { success: false, message: res?.message || 'Failed to clock' };
      }),
      catchError(() =>
        of({ success: false, message: 'Error while clocking attendance' })
      )
    );
  }

  // 📌 Get current attendance status for display
getUserAttendanceStatus(): Observable<any> {
  return this.attendanceRepo.getAttendanceStatus().pipe(
    catchError(() => of(null)) // still handle HTTP errors
  );
}



  // 📊 Get filtered attendance history (for tables, exports, etc.)
  getFilteredAttendanceHistory(filters: any): Observable<any[]> {
    return this.attendanceRepo.getAttendanceHistory(filters).pipe(
      map((res) => (res?.succeeded ? res.data?.data || [] : [])),
      catchError(() => of([]))
    );
  }

  // 🧮 Get attendance status count (for charts/summary)
  getAttendanceStatusCount(
    day: number,
    month: number
  ): Observable<{
    labels: string[];
    values: number[];
  } | null> {
    return this.attendanceRepo.getStatusCount(day, month).pipe(
      map((res) => (res?.succeeded ? res.data : null)),
      catchError(() => of(null))
    );
  }
}
