import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { LogsRepository } from '../repositories/logs.repository';

@Injectable({
  providedIn: 'root',
})
export class LogsService {
  constructor(private repository: LogsRepository) {}

  getLogs(
    pageNumber?: number,
    pageSize?: number,
    search?: string,
    roleId?: number,
    userId?: number,
    startDate?: string,
    endDate?: string,
    action?: number,
    module?: number,
    History: boolean = false
  ): Observable<any> {
    // Validate page number
    if (pageNumber && pageNumber < 1) {
      return throwError(() => new Error('Page number must be at least 1'));
    }

    // Validate date range if both are provided
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return throwError(() => new Error('Start date cannot be after end date'));
    }

    return this.repository
      .getLogs(
        pageNumber,
        pageSize,
        search,
        roleId,
        userId,
        startDate,
        endDate,
        action,
        module,
        History
      )
      .pipe(
        map((res) => res?.data ?? {}),
        catchError((err) => {
          console.error('Failed to fetch logs:', err);
          return throwError(() => err);
        })
      );
  }

  getNotifications(IsRead: boolean = false): Observable<any> {
    return this.repository.getNotifications(IsRead).pipe(
      map((res) => {
        // Add any necessary transformations here
        return res;
      }),
      catchError((err) => {
        console.error('Failed to fetch notifications:', err);
        return throwError(() => err);
      })
    );
  }

  markAllNotificationsAsRead(): Observable<any> {
    return this.repository.markAllNotificationsAsRead().pipe(
      map((res) => {
        // Add any necessary transformations here
        return res;
      }),
      catchError((err) => {
        console.error('Failed to mark notifications as read:', err);
        return throwError(() => err);
      })
    );
  }
}
