import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  Point,
  PointApiResponse,
  PointPaginationData,
  CreateEditPointModel,
} from '../../models/work-location/point.model';

@Injectable({
  providedIn: 'root',
})
export class PointRepository {
  private readonly baseUrl = `${environment.apiUrl}/points`;

  constructor(private http: HttpClient) {}

  getPaginatedPoints(filters: {
    PageNumber?: number;
    PageSize?: number;
    SearchQuery?: string;
    sectionId?: number;
    floorId?: number;
    buildingId?: number;
    organizationId?: number;
  }): Observable<PointApiResponse<PointPaginationData>> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    }

    return this.http.get<PointApiResponse<PointPaginationData>>(
      `${this.baseUrl}/pagination`,
      { params }
    );
  }

  getPointById(id: number): Observable<PointApiResponse<Point>> {
    return this.http.get<PointApiResponse<Point>>(`${this.baseUrl}/${id}`);
  }

  createPoint(
    model: CreateEditPointModel
  ): Observable<PointApiResponse<Point>> {
    return this.http.post<PointApiResponse<Point>>(
      `${this.baseUrl}/create`,
      model
    );
  }

  editPoint(model: CreateEditPointModel): Observable<PointApiResponse<Point>> {
    return this.http.put<PointApiResponse<Point>>(
      `${this.baseUrl}/edit`,
      model
    );
  }

  deletePoint(id: number): Observable<PointApiResponse<null>> {
    return this.http.post<PointApiResponse<null>>(
      `${this.baseUrl}/delete/${id}`,
      null
    );
  }

  restorePoint(id: number): Observable<PointApiResponse<null>> {
    return this.http.post<PointApiResponse<null>>(
      `${this.baseUrl}/restore/${id}`,
      null
    );
  }

  forceDeletePoint(id: number): Observable<PointApiResponse<null>> {
    return this.http.delete<PointApiResponse<null>>(
      `${this.baseUrl}/forcedelete/${id}`
    );
  }

  getDeletedPoints(): Observable<PointApiResponse<Point[]>> {
    return this.http.get<PointApiResponse<Point[]>>(
      `${this.baseUrl}/deleted/index`
    );
  }

  getPointsBySection(sectionId: number): Observable<PointApiResponse<Point[]>> {
    return this.http.get<PointApiResponse<Point[]>>(
      `${this.baseUrl}/pagination?section=${sectionId}`
    );
  }

  getPointWithUser(
    sectionId: string | number
  ): Observable<PointApiResponse<any>> {
    return this.http.get<PointApiResponse<any>>(
      `${this.baseUrl}/with-user/${sectionId}`
    );
  }
}
