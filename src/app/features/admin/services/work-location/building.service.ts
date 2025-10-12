import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  Building,
  BuildingPaginationData,
  CreateEditBuildingModel,
  BuildingTreeResponse,
} from '../../models/work-location/building.model';

import { BuildingRepository } from '../../repositories/work-location/building.repository';

@Injectable({
  providedIn: 'root',
})
export class BuildingService {
  constructor(private buildingRepo: BuildingRepository) {}

  getBuildingsPaged(filters: {
    PageNumber?: number;
    PageSize?: number;
    SearchQuery?: string;
    organizationId?: number;
    cityId?: number;
  }): Observable<BuildingPaginationData> {
    return this.buildingRepo
      .getPaginatedBuildings(filters)
      .pipe(map((resp) => resp.data));
  }

  getBuildingById(id: number): Observable<Building> {
    return this.buildingRepo.getBuildingById(id).pipe(map((resp) => resp.data));
  }

  createBuilding(building: CreateEditBuildingModel): Observable<Building> {
    return this.buildingRepo
      .createBuilding(building)
      .pipe(map((resp) => resp.data));
  }

  updateBuilding(building: CreateEditBuildingModel): Observable<Building> {
    return this.buildingRepo
      .editBuilding(building)
      .pipe(map((resp) => resp.data));
  }

  softDeleteBuilding(id: number): Observable<void> {
    return this.buildingRepo.deleteBuilding(id).pipe(map((resp) => {}));
  }

  restoreBuilding(id: number): Observable<void> {
    return this.buildingRepo.restoreBuilding(id).pipe(map((resp) => {}));
  }

  forceDeleteBuilding(id: number): Observable<void> {
    return this.buildingRepo.forceDeleteBuilding(id).pipe(map((resp) => {}));
  }

  getDeletedBuildings(): Observable<Building[]> {
    return this.buildingRepo
      .getDeletedBuildings()
      .pipe(map((resp) => resp.data));
  }

  /**
   * Get full tree of a building (floors -> sections -> points)
   */
  getBuildingTreeById(id: number): Observable<any> {
    return this.buildingRepo.getBuildingTreeById(id).pipe(map((resp) => resp));
  }

  /**
   * جلب المباني بناءً على المنظمة
   */
  getBuildingsByOrganization(organizationId: number): Observable<Building[]> {
    return this.buildingRepo
      .getBuildingsByOrganization(organizationId)
      .pipe(map((resp) => resp.data));
  }

  getBuildingWithUserShift(buildingId: string | number): Observable<any> {
    return this.buildingRepo
      .getBuildingWithUserShift(buildingId)
      .pipe(map((resp) => resp));
  }

  getBuildingShift(): Observable<any> {
    return this.buildingRepo.getBuildingShift().pipe(map((resp) => resp));
  }
}
