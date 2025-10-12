import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  Area,
  AreaApiResponse,
  AreaPaginationData,
  AreaTreeResponse,
  AreaWithUsers,
  CreateEditAreaModel,
} from '../../models/work-location/area.model';

/**
 * Repository responsible for interacting with Area-related API endpoints.
 * It handles all HTTP requests concerning areas including CRUD, pagination,
 * soft/force deletion, restoration, and assigning users.
 */
@Injectable({
  providedIn: 'root',
})
export class AreaRepository {
  private readonly baseUrl = `${environment.apiUrl}/areas`;

  constructor(private http: HttpClient) {}

  /**
   * Fetches a paginated list of areas from the server.
   * @param filters Optional filters for pagination, search, and country.
   */
  getPaginatedAreas(filters: {
    PageNumber?: number;
    PageSize?: number;
    SearchQuery?: string;
    Country?: string;
  }): Observable<AreaApiResponse<AreaPaginationData>> {
    let params = new HttpParams();

    // Dynamically build query parameters from filter object
    for (const [key, value] of Object.entries(filters)) {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    }

    return this.http.get<AreaApiResponse<AreaPaginationData>>(
      `${this.baseUrl}/pagination`,
      { params }
    );
  }

  /**
   * Retrieves a single area's details by its ID.
   * @param id The unique ID of the area to fetch.
   */
  getAreaById(id: number): Observable<AreaApiResponse<Area>> {
    return this.http.get<AreaApiResponse<Area>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Creates a new area record.
   * @param area The model containing area name, country, and assigned users.
   */
  createArea(area: CreateEditAreaModel): Observable<AreaApiResponse<Area>> {
    return this.http.post<AreaApiResponse<Area>>(
      `${this.baseUrl}/create`,
      area
    );
  }

  /**
   * Updates an existing area.
   * @param area The model including updated area data and user assignments.
   */
  editArea(area: CreateEditAreaModel): Observable<AreaApiResponse<Area>> {
    return this.http.put<AreaApiResponse<Area>>(`${this.baseUrl}/edit`, area);
  }

  /**
   * Soft-deletes an area (can be restored later).
   * @param id The ID of the area to be soft-deleted.
   */
  deleteArea(id: number): Observable<AreaApiResponse<null>> {
    return this.http.post<AreaApiResponse<null>>(
      `${this.baseUrl}/delete/${id}`,
      null
    );
  }

  /**
   * Restores a previously soft-deleted area.
   * @param id The ID of the area to restore.
   */
  restoreArea(id: number): Observable<AreaApiResponse<null>> {
    return this.http.post<AreaApiResponse<null>>(
      `${this.baseUrl}/restore/${id}`,
      null
    );
  }

  /**
   * Permanently deletes an area from the database.
   * @param id The ID of the area to force-delete.
   */
  forceDeleteArea(id: number): Observable<AreaApiResponse<null>> {
    return this.http.delete<AreaApiResponse<null>>(
      `${this.baseUrl}/forcedelete/${id}`
    );
  }

  /**
   * Retrieves a list of all areas that have been soft-deleted.
   */
  getDeletedAreas(): Observable<AreaApiResponse<Area[]>> {
    return this.http.get<AreaApiResponse<Area[]>>(
      `${this.baseUrl}/deleted/index`
    );
  }

  /**
   * Fetches a full hierarchical tree of an area by its ID.
   * The tree includes nested entities like cities, organizations, etc.
   * @param id The ID of the area to fetch the tree for.
   */
  getAreaTreeById(id: number): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/tree/${id}`
    );
  }



  /**
   * Assigns a list of users to a specific area.
   * @param payload Contains area ID and array of user IDs to assign.
   */
  assignUsersToArea(payload: {
    areaId: number;
    userIds: number[];
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/assign/area/user`, payload);
  }

  getAreasByCountry(
    countryName: string
  ): Observable<{ succeeded: boolean; data: Area[] }> {
    return this.http.get<{ succeeded: boolean; data: Area[] }>(
      `${this.baseUrl}/pagination`,
      {
        params: { country: countryName },
      }
    );
  }

  getAreaWithUser(
    sectionId: string | number
  ): Observable<AreaApiResponse<any>> {
    return this.http.get<AreaApiResponse<any>>(
      `${this.baseUrl}/with-user/${sectionId}`
    );
  }
}
