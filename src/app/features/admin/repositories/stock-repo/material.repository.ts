import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MaterialRepository {
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
   * Fetches materials with pagination, search, and filtering.
   * @param pageNumber - The page number for pagination.
   * @param pageSize - Number of records per page.
   * @param search - Search query string.
   * @param category - Filter by category ID.
   * @returns Observable containing the paginated material list.
   */
  getMaterials(
    pageNumber: number,
    pageSize?: number,
    search?: string,
    category?: number
  ): Observable<any> {
    let url = `${this.baseUrl}/materials/pagination?PageNumber=${pageNumber}`;

    const params: { [key: string]: any } = {};

    if (pageSize) params['pageSize'] = pageSize;
    if (search) params['search'] = search;
    if (category) params['CategoryId'] = category;

    const queryString = new URLSearchParams(params).toString();
    url += queryString ? `&${queryString}` : '';

    return this.http.get(url, { headers: this.getHeaders() });
  }

  /**
   * Fetches a single material by its ID.
   * @param id - The material ID.
   * @returns Observable containing the material data.
   */
  getMaterialById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/materials/${id}`, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Creates a new material.
   * @param data - Material data object to be created.
   * @returns Observable containing the created material response.
   */
  createMaterial(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/materials/create`, data, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Updates an existing material.
   * @param data - Updated material data object.
   * @returns Observable containing the updated material response.
   */
  updateMaterial(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/materials/edit`, data, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Soft deletes a material by its ID.
   * @param id - The material ID to delete.
   * @returns Observable containing the delete response.
   */
  deleteMaterial(id: number): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/materials/delete/${id}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  /**
   * Restores a previously deleted material by its ID.
   * @param id - The material ID to restore.
   * @returns Observable containing the restore response.
   */
  restoreMaterial(id: number): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/materials/restore/${id}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  /**
   * Permanently deletes a material (force delete) by its ID.
   * @param id - The material ID to permanently delete.
   * @returns Observable containing the delete response.
   */
  forceDeleteMaterial(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/materials/forcedelete/${id}`, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Retrieves the list of deleted materials.
   * @returns Observable containing the list of deleted materials.
   */
  getDeletedMaterials(): Observable<any> {
    return this.http.get(`${this.baseUrl}/materials/deleted/index`, {
      headers: this.getHeaders(),
    });
  }
}
