import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  Section,
  SectionApiResponse,
  SectionPaginationData,
  CreateEditSectionModel,
  SectionTreeResponse,
} from '../../models/work-location/section.model';

@Injectable({
  providedIn: 'root',
})
export class SectionRepository {
  private readonly baseUrl = `${environment.apiUrl}/sections`;

  constructor(private http: HttpClient) {}

  getPaginatedSections(filters: {
    PageNumber?: number;
    PageSize?: number;
    SearchQuery?: string;
    floorId?: number;
    buildingId?: number;
    organizationId?: number;
  }): Observable<SectionApiResponse<SectionPaginationData>> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    }

    return this.http.get<SectionApiResponse<SectionPaginationData>>(
      `${this.baseUrl}/pagination`,
      { params }
    );
  }

  getSectionById(id: number): Observable<SectionApiResponse<Section>> {
    return this.http.get<SectionApiResponse<Section>>(`${this.baseUrl}/${id}`);
  }

  createSection(
    model: CreateEditSectionModel
  ): Observable<SectionApiResponse<Section>> {
    return this.http.post<SectionApiResponse<Section>>(
      `${this.baseUrl}/create`,
      model
    );
  }

  editSection(
    model: CreateEditSectionModel
  ): Observable<SectionApiResponse<Section>> {
    return this.http.put<SectionApiResponse<Section>>(
      `${this.baseUrl}/edit`,
      model
    );
  }

  deleteSection(id: number): Observable<SectionApiResponse<null>> {
    return this.http.post<SectionApiResponse<null>>(
      `${this.baseUrl}/delete/${id}`,
      null
    );
  }

  restoreSection(id: number): Observable<SectionApiResponse<null>> {
    return this.http.post<SectionApiResponse<null>>(
      `${this.baseUrl}/restore/${id}`,
      null
    );
  }

  forceDeleteSection(id: number): Observable<SectionApiResponse<null>> {
    return this.http.delete<SectionApiResponse<null>>(
      `${this.baseUrl}/forcedelete/${id}`
    );
  }

  getDeletedSections(): Observable<SectionApiResponse<Section[]>> {
    return this.http.get<SectionApiResponse<Section[]>>(
      `${this.baseUrl}/deleted/index`
    );
  }

  getSectionTreeById(
    id: number
  ): Observable<SectionApiResponse<SectionTreeResponse>> {
    return this.http.get<SectionApiResponse<SectionTreeResponse>>(
      `${this.baseUrl}/tree/${id}`
    );
  }

  getSectionsByFloor(
    floorId: number
  ): Observable<{ succeeded: boolean; data: Section[]; message?: string }> {
    return this.http.get<{
      succeeded: boolean;
      data: Section[];
      message?: string;
    }>(`${this.baseUrl}/pagination?floor=${floorId}`);
  }

  getSectionWithUserShift(
    sectionId: string | number
  ): Observable<SectionApiResponse<any>> {
    return this.http.get<SectionApiResponse<any>>(
      `${this.baseUrl}/with-user-shift/${sectionId}`
    );
  }

  getSectionShift(): Observable<any> {
    const url = `${environment.apiUrl}/section-with-shift`;
    return this.http.get<any>(url);
  }


  getAuditorSections(filters: {
  PageNumber?: number;
  PageSize?: number;
  SearchQuery?: string;
  floorId?: number;
  buildingId?: number;
  organizationId?: number;
}): Observable<SectionApiResponse<SectionPaginationData>> {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== null && value !== undefined && value !== '') {
      params = params.set(key, value.toString());
    }
  }

  // Note the '/auditor' path
  return this.http.get<SectionApiResponse<SectionPaginationData>>(
    `${this.baseUrl}/auditor/pagination`,
    { params }
  );
}
}
