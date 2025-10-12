// src/app/services/dashboard.service.ts
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { DashboardRepository } from '../repository/dashboard.repository';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private dashboardRepo: DashboardRepository) {}

  getUsersCount(): Observable<any> {
    return this.dashboardRepo.getUsersCount().pipe(
      map((res) => (res?.succeeded ? res.data : null)),
      catchError(() => of(null))
    );
  }

  getTasksCompletion(year?: number, userId?: number): Observable<any[] | null> {
    return this.dashboardRepo.getTasksCompletion(year, userId).pipe(
      map((res) => (res?.succeeded ? res.data : null)),
      catchError(() => of(null))
    );
  }

  getStockPriceTotal(month: number): Observable<any> {
    return this.dashboardRepo.getStockPriceTotal(month).pipe(
      map((res) => (res?.succeeded ? res.data : null)),
      catchError(() => of(null))
    );
  }

  getActiveShiftsCount(): Observable<any> {
    return this.dashboardRepo.getActiveShiftsCount().pipe(
      map((res) => (res?.succeeded ? res.data : null)),
      catchError(() => of(null))
    );
  }

  getMaterialsUnderCount(): Observable<any> {
    return this.dashboardRepo.getMaterialsUnderCount().pipe(
      map((res) => (res?.succeeded ? res.data : null)),
      catchError(() => of(null))
    );
  }

  getStockQuantitySum(
    year?: number,
    providerId?: number
  ): Observable<any[] | null> {
    return this.dashboardRepo.getStockQuantitySum(year, providerId).pipe(
      map((res) => (res?.succeeded ? res.data : null)),
      catchError(() => of(null))
    );
  }
}
