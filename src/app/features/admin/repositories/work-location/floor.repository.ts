import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  Floor,
  FloorApiResponse,
  FloorPaginationData,
  CreateEditFloorModel,
  FloorTreeResponse,
} from '../../models/work-location/floor.model';

@Injectable({
  providedIn: 'root',
})
export class FloorRepository {
  private readonly baseUrl = `${environment.apiUrl}/floors`;

  constructor(private http: HttpClient) {}

  getPaginatedFloors(filters: {
    PageNumber?: number;
    PageSize?: number;
    SearchQuery?: string;
    buildingId?: number;
    organizationId?: number;
  }): Observable<FloorApiResponse<FloorPaginationData>> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    }

    return this.http.get<FloorApiResponse<FloorPaginationData>>(
      `${this.baseUrl}/pagination`,
      { params }
    );
  }

  getFloorById(id: number): Observable<FloorApiResponse<Floor>> {
    return this.http.get<FloorApiResponse<Floor>>(`${this.baseUrl}/${id}`);
  }

  createFloor(
    model: CreateEditFloorModel
  ): Observable<FloorApiResponse<Floor>> {
    return this.http.post<FloorApiResponse<Floor>>(
      `${this.baseUrl}/create`,
      model
    );
  }

  editFloor(model: CreateEditFloorModel): Observable<FloorApiResponse<Floor>> {
    return this.http.put<FloorApiResponse<Floor>>(
      `${this.baseUrl}/edit`,
      model
    );
  }

  deleteFloor(id: number): Observable<FloorApiResponse<null>> {
    return this.http.post<FloorApiResponse<null>>(
      `${this.baseUrl}/delete/${id}`,
      null
    );
  }

  restoreFloor(id: number): Observable<FloorApiResponse<null>> {
    return this.http.post<FloorApiResponse<null>>(
      `${this.baseUrl}/restore/${id}`,
      null
    );
  }

  forceDeleteFloor(id: number): Observable<FloorApiResponse<null>> {
    return this.http.delete<FloorApiResponse<null>>(
      `${this.baseUrl}/forcedelete/${id}`
    );
  }

  getDeletedFloors(): Observable<FloorApiResponse<Floor[]>> {
    return this.http.get<FloorApiResponse<Floor[]>>(
      `${this.baseUrl}/deleted/index`
    );
  }

  /**
   * Fetches a full hierarchical tree of a floor by its ID.
   * Includes nested sections and points.
   */
  getFloorTreeById(
    id: number
  ): Observable<FloorApiResponse<FloorTreeResponse>> {
    return this.http.get<FloorApiResponse<FloorTreeResponse>>(
      `${this.baseUrl}/tree/${id}`
    );
  }

  getFloorsByBuilding(
    buildingId: number
  ): Observable<{ succeeded: boolean; data: Floor[]; message?: string }> {
    return this.http.get<{
      succeeded: boolean;
      data: Floor[];
      message?: string;
    }>(`${this.baseUrl}/pagination?building=${buildingId}`);
  }

  getFloorWithUserShift(
    sectionId: string | number
  ): Observable<FloorApiResponse<any>> {
    return this.http.get<FloorApiResponse<any>>(
      `${this.baseUrl}/with-user-shift/${sectionId}`
    );
  }

  getFloorShift(): Observable<any> {
    const url = `${environment.apiUrl}/floor-with-shift`;
    return this.http.get<any>(url);
  }
}
