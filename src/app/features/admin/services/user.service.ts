import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  UserApiResponse,
  UserModel,
  UserPaginationData,
  WorkLocationResponse,
  WorkLocationType,
} from '../models/user.model';
import { UserRepository } from '../repositories/user.repository';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private userRepository: UserRepository) {}

  /**
   * Fetch users with filters and pagination
   */
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
  }): Observable<UserApiResponse<UserPaginationData>> {
    return this.userRepository.getUsersWithPagination(filters);
  }

  /**
   * Get a single user by ID
   */
  getUserById(userId: number): Observable<UserModel | null> {
    return this.userRepository.getUserById(userId).pipe(map((res) => res.data));
  }

  /**
   * Create a new user using FormData
   */
  createUser(formData: FormData): Observable<UserModel> {
    return this.userRepository
      .createUser(formData)
      .pipe(map((res) => res.data));
  }

  /**
   * Edit an existing user using FormData
   */
  editUser(
    formData: FormData
  ): Observable<{ succeeded: boolean; message?: string }> {
    return this.userRepository.editUser(formData);
  }

  /**
   * Soft delete a user by ID
   */
  deleteUser(userId: number): Observable<boolean> {
    return this.userRepository
      .deleteUser(userId)
      .pipe(map((res) => res.succeeded));
  }

  /**
   * Restore a previously deleted user
   */
  restoreUser(userId: number): Observable<boolean> {
    return this.userRepository
      .restoreUser(userId)
      .pipe(map((res) => res.succeeded));
  }

  /**
   * Permanently delete a user (force delete)
   */
  forceDeleteUser(userId: number): Observable<boolean> {
    return this.userRepository
      .forceDeleteUser(userId)
      .pipe(map((res) => res.succeeded));
  }

  /**
   * Fetch all deleted users (soft deleted)
   */
  getDeletedUsers(): Observable<UserModel[]> {
    return this.userRepository
      .getDeletedUsers()
      .pipe(map((res) => res.data || []));
  }

  /**
   * Get full work location details (hierarchy) of a user
   */
  getUserWorkLocation(userId: number): Observable<WorkLocationResponse | null> {
    return this.userRepository
      .getUserWithWorkLocation(userId)
      .pipe(map((res) => res.data));
  }

  /**
   * Get total user count in the system
   */
  getUserCount(): Observable<number> {
    return this.userRepository
      .getUsersCount()
      .pipe(map((res) => res.data ?? 0));
  }

  /**
   * Get users by role using promise-based approach
   */
  async getUsersByRole(roleId: number): Promise<UserModel[]> {
    const response = await firstValueFrom(
      this.getUsersWithPagination({
        RoleId: roleId,
      })
    );
    return response?.data?.data || [];
  }

  getUserWithShiftById(roleId: number): Observable<any> {
    return this.userRepository
      .getUserWithShiftById(roleId)
      .pipe(map((resp) => resp.data));
  }
}
