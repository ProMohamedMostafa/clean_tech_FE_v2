import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  UserApiResponse,
  UserModel,
  UserPaginationData,
  WorkLocationResponse,
  WorkLocationType,
} from '../models/user.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserRepository {
  private readonly baseUrl = `${environment.apiUrl}/users`;
  private readonly assignUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // Get paginated users
  getUsersWithPagination(filters: {
    PageNumber?: number;
    PageSize?: number;
    Search?: string;
    Nationality?: string;
    Country?: string;
    RoleId?: number;
    Gender?: number;
    ProviderId?: number;
    AreaId?: number;
    CityId?: number;
    OrganizationId?: number;
    BuildingId?: number;
    FloorId?: number;
    SectionId?: number;
    PointId?: number;
    Type?: WorkLocationType;
    TypeIds?: number[];
    ShiftIds?: number[];
    // Add the Type filter using the enum
  }): Observable<UserApiResponse<UserPaginationData>> {
    let params = new HttpParams();

    for (const [key, value] of Object.entries(filters)) {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    }

    return this.http.get<UserApiResponse<UserPaginationData>>(
      `${this.baseUrl}/pagination`,
      { params }
    );
  }

  // Get single user by ID
  getUserById(userId: number): Observable<UserApiResponse<UserModel>> {
    return this.http.get<UserApiResponse<UserModel>>(
      `${this.baseUrl}/${userId}`
    );
  }

  // Create new user (multipart/form-data)
  createUser(formData: FormData): Observable<UserApiResponse<UserModel>> {
    return this.http.post<UserApiResponse<UserModel>>(
      `${this.baseUrl}/create`,
      formData
    );
  }

  // Edit existing user (multipart/form-data)
  editUser(formData: FormData): Observable<UserApiResponse<UserModel>> {
    return this.http.put<UserApiResponse<UserModel>>(
      `${this.baseUrl}/edit`,
      formData
    );
  }

  // Delete user by ID (POST request)
  deleteUser(userId: number): Observable<UserApiResponse<null>> {
    return this.http.post<UserApiResponse<null>>(
      `${this.baseUrl}/delete/${userId}`,
      null
    );
  }

  // Restore deleted user by ID (POST request)
  restoreUser(userId: number): Observable<UserApiResponse<null>> {
    return this.http.post<UserApiResponse<null>>(
      `${this.baseUrl}/restore/${userId}`,
      null
    );
  }

  // Force delete user by ID (DELETE)
  forceDeleteUser(userId: number): Observable<UserApiResponse<null>> {
    return this.http.delete<UserApiResponse<null>>(
      `${this.baseUrl}/forcedelete/${userId}`
    );
  }

  // Get list of deleted users
  getDeletedUsers(): Observable<UserApiResponse<UserModel[]>> {
    return this.http.get<UserApiResponse<UserModel[]>>(
      `${this.baseUrl}/deleted/index`
    );
  }

  // Get user with work location details by user ID
  getUserWithWorkLocation(
    userId: number
  ): Observable<UserApiResponse<WorkLocationResponse>> {
    return this.http.get<UserApiResponse<WorkLocationResponse>>(
      `${this.baseUrl}/with-work-location/${userId}`
    );
  }

  getUserWithShiftById(roleId: number): Observable<any> {
    const url = `${this.assignUrl}/user-with-shift/${roleId}`;

    return this.http.get<any>(url);
  }

  // Get count of users
  // getUsersCount(): Observable<UserApiResponse<number>> {
  //   return this.http.get<UserApiResponse<number>>(`${this.baseUrl}/count`);
  // }

  getUsersCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/count`, {});
  }
}
