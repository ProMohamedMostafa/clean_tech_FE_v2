import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoryRepository {
  // Base API URL from environment file
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Retrieves the authentication token from localStorage and sets the request headers.
   * @returns HttpHeaders with Authorization token
   */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('userData')
      ? JSON.parse(localStorage.getItem('userData')!).token
      : null;
    return new HttpHeaders({
      Authorization: `Bearer ${token}`, // Attach Bearer token for authentication
      Accept: '*/*',
      'Content-Type': 'application/json',
    });
  }

  /**
   * Fetches categories with pagination, search, and filtering.
   * @param pageNumber - The page number for pagination.
   * @param pageSize - Number of records per page.
   * @param search - Search query string.
   * @param parentCategory - Filter by parent category ID.
   * @param unit - Filter by unit.
   * @returns Observable containing the paginated category list.
   */
  getCategories(
    pageNumber: number,
    pageSize?: number,
    search?: string,
    parentCategory?: number,
    unit?: number
  ): Observable<any> {
    let url = `${this.baseUrl}/categories/pagination?PageNumber=${pageNumber}`;

    const params: { [key: string]: any } = {};

    if (pageSize) params['pageSize'] = pageSize;
    if (search) params['search'] = search;
    if (parentCategory) params['parentCategory'] = parentCategory;
    if (unit) params['unit'] = unit;

    const queryString = new URLSearchParams(params).toString();
    url += queryString ? `&${queryString}` : '';

    return this.http.get(url, { headers: this.getHeaders() });
  }

  /**
   * Fetches a single category by its ID.
   * @param id - The category ID.
   * @returns Observable containing the category data.
   */
  getCategoryById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories/${id}`, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Creates a new category.
   * @param data - Category data object to be created.
   * @returns Observable containing the created category response.
   */
  createCategory(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/categories/create`, data, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Updates an existing category.
   * @param data - Updated category data object.
   * @returns Observable containing the updated category response.
   */
  updateCategory(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/categories/edit`, data, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Soft deletes a category by its ID.
   * @param id - The category ID to delete.
   * @returns Observable containing the delete response.
   */
  deleteCategory(id: number): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/categories/delete/${id}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  /**
   * Restores a previously deleted category by its ID.
   * @param id - The category ID to restore.
   * @returns Observable containing the restore response.
   */
  restoreCategory(id: number): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/categories/restore/${id}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  /**
   * Permanently deletes a category (force delete) by its ID.
   * @param id - The category ID to permanently delete.
   * @returns Observable containing the delete response.
   */
  forceDeleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/categories/forcedelete/${id}`, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Retrieves the list of deleted categories.
   * @returns Observable containing the list of deleted categories.
   */
  getDeletedCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories/deleted/index`, {
      headers: this.getHeaders(),
    });
  }
}
