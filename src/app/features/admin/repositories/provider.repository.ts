// provider.repository.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ProviderResponse } from '../models/provider.model';

@Injectable({
  providedIn: 'root',
})
export class ProviderRepository {
  private baseUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get all providers
  // getAll(): Observable<ProviderResponse> {
  //   return this.http
  //     .get<ProviderResponse>(`${this.baseUrl}/providers`)
  //     .pipe(catchError(this.handleError));
  // }

  // Get paginated providers
  getPaginated(
    pageNumber: number = 1,
    pageSize?: number,
    searchQuery?: string
  ): Observable<any> {
    let url = `${this.baseUrl}/providers/pagination?pageNumber=${pageNumber}`;
    if (pageSize) url += `&pageSize=${pageSize}`;
    if (searchQuery && searchQuery.trim())
      url += `&SearchQuery=${encodeURIComponent(searchQuery.trim())}`;

    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  // Get provider by id
  getById(providerId: number): Observable<ProviderResponse> {
    return this.http
      .get<ProviderResponse>(`${this.baseUrl}/providers/${providerId}`)
      .pipe(catchError(this.handleError));
  }

  // Create a new provider
  create(providerData: any): Observable<ProviderResponse> {
    return this.http
      .post<ProviderResponse>(`${this.baseUrl}/providers/create`, providerData)
      .pipe(catchError(this.handleError));
  }

  // Update a provider
  update(providerData: any): Observable<ProviderResponse> {
    return this.http
      .put<ProviderResponse>(`${this.baseUrl}/providers/edit`, providerData)
      .pipe(catchError(this.handleError));
  }

  // Delete a provider
  delete(providerId: number): Observable<ProviderResponse> {
    return this.http
      .post<ProviderResponse>(
        `${this.baseUrl}/providers/delete/${providerId}`,
        {}
      )
      .pipe(catchError(this.handleError));
  }

  // Force delete a provider
  forceDelete(providerId: string): Observable<ProviderResponse> {
    return this.http
      .delete<ProviderResponse>(
        `${this.baseUrl}/providers/forcedelete/${providerId}`
      )
      .pipe(catchError(this.handleError));
  }

  // Restore a provider
  restore(providerId: number): Observable<ProviderResponse> {
    return this.http
      .post<ProviderResponse>(
        `${this.baseUrl}/providers/restore/${providerId}`,
        {}
      )
      .pipe(catchError(this.handleError));
  }

  // Get deleted providers
  getDeleted(): Observable<ProviderResponse> {
    return this.http
      .get<ProviderResponse>(`${this.baseUrl}/providers/deleted/index`)
      .pipe(catchError(this.handleError));
  }

  // Error handling
  private handleError(error: any): Observable<never> {
    console.error('Repository error:', error);
    throw error;
  }
}
