import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  Organization,
  OrganizationApiResponse,
  OrganizationPaginationData,
  OrganizationWithUsers,
  CreateEditOrganizationModel,
  OrganizationTreeResponse,
} from '../../models/work-location/organization.model';

@Injectable({
  providedIn: 'root',
})
export class OrganizationRepository {
  private readonly baseUrl = `${environment.apiUrl}/organizations`;

  constructor(private http: HttpClient) {}

  getPaginatedOrganizations(filters: {
    PageNumber?: number;
    PageSize?: number;
    SearchQuery?: string;
    city?: number;
  }): Observable<OrganizationApiResponse<OrganizationPaginationData>> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    }

    return this.http.get<OrganizationApiResponse<OrganizationPaginationData>>(
      `${this.baseUrl}/pagination`,
      { params }
    );
  }

  getOrganizationById(
    id: number
  ): Observable<OrganizationApiResponse<Organization>> {
    return this.http.get<OrganizationApiResponse<Organization>>(
      `${this.baseUrl}/${id}`
    );
  }

  createOrganization(
    model: CreateEditOrganizationModel
  ): Observable<OrganizationApiResponse<Organization>> {
    return this.http.post<OrganizationApiResponse<Organization>>(
      `${this.baseUrl}/create`,
      model
    );
  }

  editOrganization(
    model: CreateEditOrganizationModel
  ): Observable<OrganizationApiResponse<Organization>> {
    return this.http.put<OrganizationApiResponse<Organization>>(
      `${this.baseUrl}/edit`,
      model
    );
  }

  deleteOrganization(id: number): Observable<OrganizationApiResponse<null>> {
    return this.http.post<OrganizationApiResponse<null>>(
      `${this.baseUrl}/delete/${id}`,
      null
    );
  }

  restoreOrganization(id: number): Observable<OrganizationApiResponse<null>> {
    return this.http.post<OrganizationApiResponse<null>>(
      `${this.baseUrl}/restore/${id}`,
      null
    );
  }

  forceDeleteOrganization(
    id: number
  ): Observable<OrganizationApiResponse<null>> {
    return this.http.delete<OrganizationApiResponse<null>>(
      `${this.baseUrl}/forcedelete/${id}`
    );
  }

  getDeletedOrganizations(): Observable<
    OrganizationApiResponse<Organization[]>
  > {
    return this.http.get<OrganizationApiResponse<Organization[]>>(
      `${this.baseUrl}/deleted/index`
    );
  }

  getOrganizationWithUsers(
    id: number
  ): Observable<OrganizationApiResponse<OrganizationWithUsers>> {
    return this.http.get<OrganizationApiResponse<OrganizationWithUsers>>(
      `${this.baseUrl}/with-user-shift/${id}`
    );
  }

  assignUsersToOrganization(payload: {
    organizationId: number;
    userIds: number[];
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/assign/organization/user`, payload);
  }

  /**
   * Fetches a full hierarchical tree of an organization by its ID.
   * Includes nested entities like buildings, floors, sections, and points.
   * @param id The ID of the organization.
   */

  getOrganizationTreeById(
    id: number
  ): Observable<OrganizationApiResponse<OrganizationTreeResponse>> {
    return this.http.get<OrganizationApiResponse<OrganizationTreeResponse>>(
      `${this.baseUrl}/tree/${id}`
    );
  }

  getOrganizationsByCity(cityId: number): Observable<{
    succeeded: boolean;
    data: Organization[];
    message?: string;
  }> {
    return this.http.get<{
      succeeded: boolean;
      data: Organization[];
      message?: string;
    }>(`${this.baseUrl}/pagination?city=${cityId}`);
  }

  getOrganizationWithUserShift(
    sectionId: string | number
  ): Observable<OrganizationApiResponse<any>> {
    return this.http.get<OrganizationApiResponse<any>>(
      `${this.baseUrl}/with-user-shift/${sectionId}`
    );
  }
  getOrganizationShift(): Observable<any> {
    const url = `${environment.apiUrl}/organization-with-shift`;
    return this.http.get<any>(url);
  }

  
}
