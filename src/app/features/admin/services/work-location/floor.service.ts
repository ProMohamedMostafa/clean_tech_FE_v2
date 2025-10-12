import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  Floor,
  FloorPaginationData,
  CreateEditFloorModel,
  FloorTreeResponse,
} from '../../models/work-location/floor.model';

import { FloorRepository } from '../../repositories/work-location/floor.repository';

@Injectable({
  providedIn: 'root',
})
export class FloorService {
  constructor(private floorRepo: FloorRepository) {}

  getFloorsPaged(filters: {
    PageNumber?: number;
    PageSize?: number;
    SearchQuery?: string;
    buildingId?: number;
    organizationId?: number;
  }): Observable<FloorPaginationData> {
    return this.floorRepo
      .getPaginatedFloors(filters)
      .pipe(map((resp) => resp.data));
  }

  getFloorById(id: number): Observable<Floor> {
    return this.floorRepo.getFloorById(id).pipe(map((resp) => resp.data));
  }

  createFloor(floor: CreateEditFloorModel): Observable<Floor> {
    return this.floorRepo.createFloor(floor).pipe(map((resp) => resp.data));
  }

  updateFloor(floor: CreateEditFloorModel): Observable<Floor> {
    return this.floorRepo.editFloor(floor).pipe(map((resp) => resp.data));
  }

  softDeleteFloor(id: number): Observable<void> {
    return this.floorRepo.deleteFloor(id).pipe(map((resp) => {}));
  }

  restoreFloor(id: number): Observable<void> {
    return this.floorRepo.restoreFloor(id).pipe(map((resp) => {}));
  }

  forceDeleteFloor(id: number): Observable<void> {
    return this.floorRepo.forceDeleteFloor(id).pipe(map((resp) => {}));
  }

  getDeletedFloors(): Observable<Floor[]> {
    return this.floorRepo.getDeletedFloors().pipe(map((resp) => resp.data));
  }

  /**
   * Get full tree of a floor (sections -> points)
   */
  getFloorTreeById(id: number): Observable<any> {
    return this.floorRepo.getFloorTreeById(id).pipe(map((resp) => resp));
  }

  /**
   * جلب الطوابق بناءً على معرف المبنى (buildingId)
   */
  getFloorsByBuilding(buildingId: number): Observable<Floor[]> {
    return this.floorRepo
      .getFloorsByBuilding(buildingId)
      .pipe(map((resp) => resp.data));
  }

  getFloorWithUserShift(floorId: string | number): Observable<any> {
    return this.floorRepo
      .getFloorWithUserShift(floorId)
      .pipe(map((resp) => resp));
  }

  getFloorShift(): Observable<any> {
    return this.floorRepo.getFloorShift().pipe(map((resp) => resp));
  }
}
