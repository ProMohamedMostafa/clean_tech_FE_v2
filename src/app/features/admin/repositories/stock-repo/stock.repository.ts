import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StockRepository {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const userData = localStorage.getItem('userData');
    const token = userData ? JSON.parse(userData).token : null;
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      accept: '*/*',
    });
  }

  addStockIn(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/stock/in`, formData, {
      headers: this.getHeaders(),
    });
  }

  addStockOut(payload: {
    materialId: number;
    providerId: number;
    quantity: number;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/stock/out`, payload, {
      headers: this.getHeaders().set('Content-Type', 'application/json'),
    });
  }

  getStockInTransactions(
    pageNumber: number,
    pageSize?: number,
    search?: string,
    userId?: number,
    startDate?: string,
    endDate?: string,
    providerId?: number,
    categoryId?: number
  ): Observable<any> {
    let url = `${this.baseUrl}/stock/in/transactions?PageNumber=${pageNumber}`;
    const params: { [key: string]: any } = {};

    if (pageSize) params['PageSize'] = pageSize;
    if (search) params['Search'] = search;
    if (userId) params['UserId'] = userId;
    if (startDate) params['StartDate'] = startDate;
    if (endDate) params['EndDate'] = endDate;
    if (providerId) params['ProviderId'] = providerId;
    if (categoryId) params['CategoryId'] = categoryId;

    const queryString = new URLSearchParams(params).toString();
    url += queryString ? `&${queryString}` : '';

    return this.http.get(url, { headers: this.getHeaders() });
  }

  getStockOutTransactions(
    pageNumber: number,
    pageSize?: number,
    search?: string,
    userId?: number,
    startDate?: string,
    endDate?: string,
    providerId?: number,
    categoryId?: number
  ): Observable<any> {
    let url = `${this.baseUrl}/stock/out/transactions?PageNumber=${pageNumber}`;
    const params: { [key: string]: any } = {};

    if (pageSize) params['PageSize'] = pageSize;
    if (search) params['Search'] = search;
    if (userId) params['UserId'] = userId;
    if (startDate) params['StartDate'] = startDate;
    if (endDate) params['EndDate'] = endDate;
    if (providerId) params['ProviderId'] = providerId;
    if (categoryId) params['CategoryId'] = categoryId;

    const queryString = new URLSearchParams(params).toString();
    url += queryString ? `&${queryString}` : '';

    return this.http.get(url, { headers: this.getHeaders() });
  }

  getStockTransactions(
    pageNumber: number,
    pageSize?: number,
    search?: string,
    userId?: number,
    startDate?: string,
    endDate?: string,
    providerId?: number,
    categoryId?: number,
    type?: number
  ): Observable<any> {
    let url = `${this.baseUrl}/stock/transactions?PageNumber=${pageNumber}`;
    const params: { [key: string]: any } = {};

    if (pageSize) params['PageSize'] = pageSize;
    if (search) params['Search'] = search;
    if (userId) params['UserId'] = userId;
    if (startDate) params['StartDate'] = startDate;
    if (endDate) params['EndDate'] = endDate;
    if (providerId) params['ProviderId'] = providerId;
    if (categoryId) params['CategoryId'] = categoryId;
    if (type !== undefined) params['Type'] = type;

    const queryString = new URLSearchParams(params).toString();
    url += queryString ? `&${queryString}` : '';

    return this.http.get(url, { headers: this.getHeaders() });
  }
}
