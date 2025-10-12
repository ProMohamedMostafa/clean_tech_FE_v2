import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminDashboardRepository {
  private readonly baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // ✅ 1. Get users count
  getUsersCount(): Observable<any> {
    const url = `${this.baseUrl}/users/count`;
    return this.http.get<any>(url);
  }

  // ✅ 2. Get tasks completion with filters
  getTasksCompletion(filters: {
    Year?: number;
    UserId?: number;
  }): Observable<any> {
    const url = `${this.baseUrl}/tasks/completion`;
    let params = new HttpParams();

    for (const [key, value] of Object.entries(filters)) {
      if (value !== null && value !== undefined) {
        params = params.set(key, value.toString());
      }
    }

    return this.http.get<any>(url, { params });
  }

  // ✅ 3. Get stock price total by month
  getStockPriceTotal(month: number): Observable<any> {
    const url = `${this.baseUrl}/stock/price/total`;
    const params = new HttpParams().set('Month', month.toString());
    return this.http.get<any>(url, { params });
  }

  // ✅ 4. Get active shifts count
  getActiveShiftsCount(): Observable<any> {
    const url = `${this.baseUrl}/shifts/active/count`;
    return this.http.get<any>(url);
  }

  // ✅ 5. Get materials under count
  getMaterialsUnderCount(): Observable<any> {
    const url = `${this.baseUrl}/materials/under/count`;
    return this.http.get<any>(url);
  }

  // ✅ 6. Get stock quantity sum with filters
  getStockQuantitySum(filters: {
    Year?: number;
    ProviderId?: number;
  }): Observable<any> {
    const url = `${this.baseUrl}/stock/quantity/sum`;
    let params = new HttpParams();

    for (const [key, value] of Object.entries(filters)) {
      if (value !== null && value !== undefined) {
        params = params.set(key, value.toString());
      }
    }

    return this.http.get<any>(url, { params });
  }
}
