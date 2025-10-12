import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  Point,
  PointPaginationData,
  CreateEditPointModel,
} from '../../models/work-location/point.model';

import { PointRepository } from '../../repositories/work-location/point.repository';

@Injectable({
  providedIn: 'root',
})
export class PointService {
  constructor(private pointRepo: PointRepository) {}

  getPointsPaged(filters: {
    PageNumber?: number;
    PageSize?: number;
    SearchQuery?: string;
    sectionId?: number;
    floorId?: number;
  }): Observable<PointPaginationData> {
    return this.pointRepo.getPaginatedPoints(filters).pipe(
      map((resp) => {
        if (resp.succeeded) return resp.data;
        throw new Error(resp.message);
      })
    );
  }

  getPointById(id: number): Observable<Point> {
    return this.pointRepo.getPointById(id).pipe(
      map((resp) => {
        if (resp.succeeded) return resp.data;
        throw new Error(resp.message);
      })
    );
  }

  createPoint(point: CreateEditPointModel): Observable<Point> {
    return this.pointRepo.createPoint(point).pipe(
      map((resp) => {
        if (resp.succeeded) return resp.data;
        throw new Error(resp.message);
      })
    );
  }

  updatePoint(point: CreateEditPointModel): Observable<Point> {
    return this.pointRepo.editPoint(point).pipe(
      map((resp) => {
        if (resp.succeeded) return resp.data;
        throw new Error(resp.message);
      })
    );
  }

  softDeletePoint(id: number): Observable<void> {
    return this.pointRepo.deletePoint(id).pipe(
      map((resp) => {
        if (resp.succeeded) return;
        throw new Error(resp.message);
      })
    );
  }

  restorePoint(id: number): Observable<void> {
    return this.pointRepo.restorePoint(id).pipe(
      map((resp) => {
        if (resp.succeeded) return;
        throw new Error(resp.message);
      })
    );
  }

  forceDeletePoint(id: number): Observable<void> {
    return this.pointRepo.forceDeletePoint(id).pipe(
      map((resp) => {
        if (resp.succeeded) return;
        throw new Error(resp.message);
      })
    );
  }

  getDeletedPoints(): Observable<Point[]> {
    return this.pointRepo.getDeletedPoints().pipe(
      map((resp) => {
        if (resp.succeeded) return resp.data;
        throw new Error(resp.message);
      })
    );
  }

  getPointsBySection(sectionId: number): Observable<Point[]> {
    return this.pointRepo.getPointsBySection(sectionId).pipe(
      map((resp) => {
        if (resp.succeeded) return resp.data;
        throw new Error(resp.message);
      })
    );
  }

  // Get point along with user shifts by point ID
  getPointWithUser(pointId: string | number): Observable<any> {
    return this.pointRepo.getPointWithUser(pointId).pipe(
      map((resp) => {
        if (resp.succeeded) return resp;
        throw new Error(resp.message);
      })
    );
  }
}
