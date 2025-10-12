import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  Area,
  AreaPaginationData,
  AreaTreeResponse,
  AreaWithUsers,
  CreateEditAreaModel,
} from '../../models/work-location/area.model';
import { AreaRepository } from '../../repositories/work-location/area.repository';

/**
 * Service responsible for managing business logic related to areas.
 * Acts as a bridge between components and the AreaRepository (API layer).
 */
@Injectable({
  providedIn: 'root',
})
export class AreaService {
  constructor(private readonly areaRepo: AreaRepository) {}

  /**
   * Get all areas with pagination, filters, and search capability.
   * @param filters Pagination and filter options like page number, search query, country, etc.
   */
  getPaginatedAreas(filters: {
    PageNumber?: number;
    PageSize?: number;
    SearchQuery?: string;
    Country?: string;
  }): Observable<AreaPaginationData> {
    return this.areaRepo.getPaginatedAreas(filters).pipe(
      map((res) => res.data)
    );
  }

  /**
   * Get area details by ID.
   * @param id Area ID to fetch.
   */
  getAreaById(id: number): Observable<any> {
    return this.areaRepo.getAreaById(id).pipe(
      map((res) => {
        if (res.data) return res;
        return {
          succeeded: true,
          message: 'Success',
          data: res,
        };
      })
    );
  }

  /**
   * Create or update area based on presence of ID.
   * @param areaData Area data (with optional ID).
   */
  saveArea(areaData: CreateEditAreaModel): Observable<Area> {
    if (areaData.id) {
      return this.editArea(areaData);
    } else {
      return this.createArea(areaData);
    }
  }

  /**
   * Create a new area.
   * @param areaData New area model with name, country, and users.
   */
  createArea(areaData: CreateEditAreaModel): Observable<Area> {
    return this.areaRepo.createArea(areaData).pipe(
      map((res) => res.data)
    );
  }

  /**
   * Edit an existing area.
   * @param areaData Updated area data including ID.
   */
  editArea(areaData: CreateEditAreaModel): Observable<Area> {
    return this.areaRepo.editArea(areaData).pipe(
      map((res) => res.data)
    );
  }

  /**
   * Soft-delete an area by ID.
   * @param id Area ID to delete.
   */
  deleteArea(id: number): Observable<boolean> {
    return this.areaRepo.deleteArea(id).pipe(
      map(() => true)
    );
  }

  /**
   * Restore a soft-deleted area.
   * @param id Area ID to restore.
   */
  restoreArea(id: number): Observable<boolean> {
    return this.areaRepo.restoreArea(id).pipe(
      map(() => true)
    );
  }

  /**
   * Permanently delete an area.
   * @param id Area ID to force delete.
   */
  forceDeleteArea(id: number): Observable<boolean> {
    return this.areaRepo.forceDeleteArea(id).pipe(
      map(() => true)
    );
  }

  /**
   * Fetch all soft-deleted areas.
   */
  getDeletedAreas(): Observable<Area[]> {
    return this.areaRepo.getDeletedAreas().pipe(
      map((res) => res.data)
    );
  }

  /**
   * Get full area hierarchy tree by area ID.
   * Includes cities, organizations, buildings, floors, etc.
   * @param areaId ID of the root area.
   */
  getAreaTree(areaId: number): Observable<any> {
    return this.areaRepo.getAreaTreeById(areaId).pipe(
      map((res) => res)
    );
  }

  /**
   * Assign a set of users to an area.
   * @param areaId The ID of the area.
   * @param userIds Array of user IDs to assign.
   */
  assignUsersToArea(areaId: number, userIds: number[]): Observable<boolean> {
    return this.areaRepo.assignUsersToArea({ areaId, userIds }).pipe(
      map(() => true)
    );
  }

  /**
   * Get list of areas by country name (without pagination).
   * @param countryName Name of the country to filter areas.
   */
  getAreasByCountry(countryName: string): Observable<Area[]> {
    return this.areaRepo.getAreasByCountry(countryName).pipe(
      map((res) => res.data)
    );
  }

  getAreaWithUser(areaId: string | number): Observable<any> {
    return this.areaRepo.getAreaWithUser(areaId).pipe(
      map((resp) => resp)
    );
  }
}