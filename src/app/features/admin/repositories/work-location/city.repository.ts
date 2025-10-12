import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  City,
  CityApiResponse,
  CityPaginationData,
  CityTreeResponse,
  CityWithUsers,
  CreateEditCityModel,
} from '../../models/work-location/city.model';

/**
 * Repository responsible for interacting with City-related API endpoints.
 * It handles all HTTP requests concerning cities including CRUD, pagination,
 * soft/force deletion, restoration, and assigning users.
 */
@Injectable({
  providedIn: 'root',
})
export class CityRepository {
  private readonly baseUrl = `${environment.apiUrl}/cities`;

  constructor(private http: HttpClient) {}

  /**
   * Fetches a paginated list of cities from the server.
   * @param filters Optional filters for pagination, search, and country.
   */
  getPaginatedCities(filters: {
    PageNumber?: number;
    PageSize?: number;
    SearchQuery?: string;
    area?: number;
    Country?: string;
  }): Observable<CityApiResponse<CityPaginationData>> {
    let params = new HttpParams();

    for (const [key, value] of Object.entries(filters)) {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    }

    return this.http.get<CityApiResponse<CityPaginationData>>(
      `${this.baseUrl}/pagination`,
      { params }
    );
  }

  /**
   * Retrieves a single city's details by its ID.
   * @param id The unique ID of the city to fetch.
   */
  getCityById(id: number): Observable<CityApiResponse<City>> {
    return this.http.get<CityApiResponse<City>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Creates a new city record.
   * @param city The model containing city name, country, and assigned users.
   */
  createCity(city: CreateEditCityModel): Observable<CityApiResponse<City>> {
    return this.http.post<CityApiResponse<City>>(
      `${this.baseUrl}/create`,
      city
    );
  }

  /**
   * Updates an existing city.
   * @param city The model including updated city data and user assignments.
   */
  editCity(city: CreateEditCityModel): Observable<CityApiResponse<City>> {
    return this.http.put<CityApiResponse<City>>(`${this.baseUrl}/edit`, city);
  }

  /**
   * Soft-deletes a city (can be restored later).
   * @param id The ID of the city to be soft-deleted.
   */
  deleteCity(id: number): Observable<CityApiResponse<null>> {
    return this.http.post<CityApiResponse<null>>(
      `${this.baseUrl}/delete/${id}`,
      null
    );
  }

  /**
   * Restores a previously soft-deleted city.
   * @param id The ID of the city to restore.
   */
  restoreCity(id: number): Observable<CityApiResponse<null>> {
    return this.http.post<CityApiResponse<null>>(
      `${this.baseUrl}/restore/${id}`,
      null
    );
  }

  /**
   * Permanently deletes a city from the database.
   * @param id The ID of the city to force-delete.
   */
  forceDeleteCity(id: number): Observable<CityApiResponse<null>> {
    return this.http.delete<CityApiResponse<null>>(
      `${this.baseUrl}/forcedelete/${id}`
    );
  }

  /**
   * Retrieves a list of all cities that have been soft-deleted.
   */
  getDeletedCities(): Observable<CityApiResponse<City[]>> {
    return this.http.get<CityApiResponse<City[]>>(
      `${this.baseUrl}/deleted/index`
    );
  }

  /**
   * Fetches a full hierarchical tree of a city by its ID.
   * The tree includes nested entities like organizations, buildings, etc.
   * @param id The ID of the city to fetch the tree for.
   */
  getCityTreeById(id: number): Observable<CityApiResponse<CityTreeResponse>> {
    return this.http.get<CityApiResponse<CityTreeResponse>>(
      `${this.baseUrl}/tree/${id}`
    );
  }

  /**
   * Retrieves a city along with all users assigned to it.
   * @param cityId The ID of the city to fetch user assignments for.
   */
  getCityWithUsers(cityId: number): Observable<CityApiResponse<CityWithUsers>> {
    return this.http.get<CityApiResponse<CityWithUsers>>(
      `${this.baseUrl}/with-user/${cityId}`
    );
  }

  /**
   * Assigns a list of users to a specific city.
   * @param payload Contains city ID and array of user IDs to assign.
   */
  assignUsersToCity(payload: {
    cityId: number;
    userIds: number[];
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/assign/city/user`, payload);
  }

  getCitiesByArea(
    areaId: number
  ): Observable<{ succeeded: boolean; data: City[]; message?: string }> {
    return this.http.get<{
      succeeded: boolean;
      data: City[];
      message?: string;
    }>(`${this.baseUrl}/pagination?Area=${areaId}`);
  }

  getCityWithUser(
    sectionId: string | number
  ): Observable<CityApiResponse<any>> {
    return this.http.get<CityApiResponse<any>>(
      `${this.baseUrl}/with-user/${sectionId}`
    );
  }
  /**
   * Fetch an area tree by city ID (custom structure assumed)
   * This is a different structure from getCityTreeById
   */
  getCustomCityTree(cityId: number): Observable<any> {
    const url = `${this.baseUrl}/tree/${cityId}`;
    return this.http.get<any>(url);
  }
}
