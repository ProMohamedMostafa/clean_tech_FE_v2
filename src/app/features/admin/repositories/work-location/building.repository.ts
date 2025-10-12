import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  Building,
  BuildingApiResponse,
  BuildingPaginationData,
  CreateEditBuildingModel,
  BuildingTreeResponse,
} from '../../models/work-location/building.model';

@Injectable({
  providedIn: 'root',
})
export class BuildingRepository {
  private readonly baseUrl = `${environment.apiUrl}/buildings`;

  constructor(private http: HttpClient) {}

  getPaginatedBuildings(filters: {
    PageNumber?: number;
    PageSize?: number;
    SearchQuery?: string;
    organizationId?: number;
    cityId?: number;
  }): Observable<BuildingApiResponse<BuildingPaginationData>> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    }

    return this.http.get<BuildingApiResponse<BuildingPaginationData>>(
      `${this.baseUrl}/pagination`,
      { params }
    );
  }

  getBuildingById(id: number): Observable<BuildingApiResponse<Building>> {
    return this.http.get<BuildingApiResponse<Building>>(
      `${this.baseUrl}/${id}`
    );
  }

  createBuilding(
    model: CreateEditBuildingModel
  ): Observable<BuildingApiResponse<Building>> {
    return this.http.post<BuildingApiResponse<Building>>(
      `${this.baseUrl}/create`,
      model
    );
  }

  editBuilding(
    model: CreateEditBuildingModel
  ): Observable<BuildingApiResponse<Building>> {
    return this.http.put<BuildingApiResponse<Building>>(
      `${this.baseUrl}/edit`,
      model
    );
  }

  deleteBuilding(id: number): Observable<BuildingApiResponse<null>> {
    return this.http.post<BuildingApiResponse<null>>(
      `${this.baseUrl}/delete/${id}`,
      null
    );
  }

  restoreBuilding(id: number): Observable<BuildingApiResponse<null>> {
    return this.http.post<BuildingApiResponse<null>>(
      `${this.baseUrl}/restore/${id}`,
      null
    );
  }

  forceDeleteBuilding(id: number): Observable<BuildingApiResponse<null>> {
    return this.http.delete<BuildingApiResponse<null>>(
      `${this.baseUrl}/forcedelete/${id}`
    );
  }

  getDeletedBuildings(): Observable<BuildingApiResponse<Building[]>> {
    return this.http.get<BuildingApiResponse<Building[]>>(
      `${this.baseUrl}/deleted/index`
    );
  }

  /**
   * Fetches a full hierarchical tree of a building by its ID.
   * Includes nested floors, sections, and points.
   */
  getBuildingTreeById(
    id: number
  ): Observable<BuildingApiResponse<BuildingTreeResponse>> {
    return this.http.get<BuildingApiResponse<BuildingTreeResponse>>(
      `${this.baseUrl}/tree/${id}`
    );
  }

  getBuildingsByOrganization(
    organizationId: number
  ): Observable<{ succeeded: boolean; data: Building[]; message?: string }> {
    return this.http.get<{
      succeeded: boolean;
      data: Building[];
      message?: string;
    }>(`${this.baseUrl}/pagination?OrganizationId=${organizationId}`);
  }

  getBuildingWithUserShift(
    sectionId: string | number
  ): Observable<BuildingApiResponse<any>> {
    return this.http.get<BuildingApiResponse<any>>(
      `${this.baseUrl}/with-user-shift/${sectionId}`
    );
  }

  getBuildingShift(): Observable<any> {
    const url = `${environment.apiUrl}/building-with-shift`;
    return this.http.get<any>(url);
  }
}
