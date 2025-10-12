// src/app/repository/dashboard.repository.ts
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DashboardRepository {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const token = userData?.token;
    return new HttpHeaders({
      accept: '*/*',
      Authorization: `Bearer ${token}`,
    });
  }

  getUsersCount(): Observable<any> {
    const url = `${this.baseUrl}/users/count`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  getTasksCompletion(year?: number, userId?: number): Observable<any> {
    const url = `${this.baseUrl}/tasks/completion`;
    let params = new HttpParams();

    if (year !== undefined && year !== null) {
      params = params.set('Year', year.toString());
    }
    if (userId !== undefined && userId !== null) {
      params = params.set('UserId', userId.toString());
    }

    return this.http.get<any>(url, { headers: this.getHeaders(), params });
  }

  getStockPriceTotal(month: number): Observable<any> {
    const url = `${this.baseUrl}/stock/price/total`;
    const params = new HttpParams().set('Month', month.toString());
    return this.http.get<any>(url, { headers: this.getHeaders(), params });
  }

  getActiveShiftsCount(): Observable<any> {
    const url = `${this.baseUrl}/shifts/active/count`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  getMaterialsUnderCount(): Observable<any> {
    const url = `${this.baseUrl}/materials/under/count`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  getStockQuantitySum(year?: number, providerId?: number): Observable<any> {
    const url = `${this.baseUrl}/stock/quantity/sum`;
    let params = new HttpParams();

    if (year !== undefined && year !== null) {
      params = params.set('Year', year.toString());
    }
    if (providerId !== undefined && providerId !== null) {
      params = params.set('ProviderId', providerId.toString());
    }

    return this.http.get<any>(url, { headers: this.getHeaders(), params });
  }
}
