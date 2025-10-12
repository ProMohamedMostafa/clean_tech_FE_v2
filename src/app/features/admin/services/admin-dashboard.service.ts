import { Injectable } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';
import { AdminDashboardRepository } from '../repositories/admin-dashboard.repository';

@Injectable({
  providedIn: 'root',
})
export class AdminDashboardService {
  constructor(private adminDashboardRepo: AdminDashboardRepository) {}

  // 👥 Get users count with error handling
  getUsersCount(): Observable<{
    total: number | null;
    labels: string[];
    values: number[];
    success: boolean;
  }> {
    return this.adminDashboardRepo.getUsersCount().pipe(
      map((res) => ({
        total: res?.succeeded ? res.data.total : null,
        labels: res?.succeeded ? res.data.labels : [],
        values: res?.succeeded ? res.data.values : [],
        success: res?.succeeded || false,
      })),
      catchError(() =>
        of({ total: null, labels: [], values: [], success: false })
      )
    );
  }

  // ✅ Get tasks completion data
  getTasksCompletion(filters: {
    Year?: number;
    UserId?: number;
  }): Observable<any> {
    return this.adminDashboardRepo.getTasksCompletion(filters).pipe(
      map((res) => {
        if (res?.succeeded && res.data) {
          // Validate that the response has the expected structure
          if (res.data.labels && res.data.values) {
            return res.data;
          }
          console.warn('Unexpected data structure in task completion response');
        }
        return null;
      }),
      catchError((error) => {
        console.error('Error in getTasksCompletion:', error);
        return of(null);
      })
    );
  }

  // 💰 Get stock price total
  getStockPriceTotal(month: number): Observable<{
    currentMonthTotal: number | null;
    percentageChange: number | null;
    success: boolean;
  }> {
    return this.adminDashboardRepo.getStockPriceTotal(month).pipe(
      map((res) => ({
        currentMonthTotal: res?.succeeded ? res.data.currentMonthTotal : null,
        percentageChange: res?.succeeded ? res.data.percentageChange : null,
        success: res?.succeeded || false,
      })),
      catchError(() =>
        of({ currentMonthTotal: null, percentageChange: null, success: false })
      )
    );
  }

  // 🕐 Get active shifts count
  getActiveShiftsCount(): Observable<{
    totalCount: number | null;
    activeCount: number | null;
    inactiveCount: number | null;
    activePercentage: number | null;
    success: boolean;
  }> {
    return this.adminDashboardRepo.getActiveShiftsCount().pipe(
      map((res) => ({
        totalCount: res?.succeeded ? res.data.totalCount : null,
        activeCount: res?.succeeded ? res.data.activeCount : null,
        inactiveCount: res?.succeeded ? res.data.inactiveCount : null,
        activePercentage: res?.succeeded ? res.data.activePercentage : null,
        success: res?.succeeded || false,
      })),
      catchError(() =>
        of({
          totalCount: null,
          activeCount: null,
          inactiveCount: null,
          activePercentage: null,
          success: false,
        })
      )
    );
  }

  // 📦 Get materials under count
  getMaterialsUnderCount(): Observable<{
    count: number | null;
    percentage: number | null;
    success: boolean;
  }> {
    return this.adminDashboardRepo.getMaterialsUnderCount().pipe(
      map((res) => ({
        count: res?.succeeded ? res.data.count : null,
        percentage: res?.succeeded ? res.data.percentage : null,
        success: res?.succeeded || false,
      })),
      catchError(() => of({ count: null, percentage: null, success: false }))
    );
  }

  // 📊 Get stock quantity sum
  getStockQuantitySum(filters: {
    Year?: number;
    ProviderId?: number;
  }): Observable<{ sum: number | null; success: boolean }> {
    return this.adminDashboardRepo.getStockQuantitySum(filters).pipe(
      map((res) => ({
        sum: res?.succeeded ? res.data : null,
        success: res?.succeeded || false,
      })),
      catchError(() => of({ sum: null, success: false }))
    );
  }
}
