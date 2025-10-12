import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  Section,
  SectionPaginationData,
  CreateEditSectionModel,
  SectionTreeResponse,
} from '../../models/work-location/section.model';

import { SectionRepository } from '../../repositories/work-location/section.repository';

@Injectable({
  providedIn: 'root',
})
export class SectionService {
  constructor(private sectionRepo: SectionRepository) {}

  getSectionsPaged(filters: {
    PageNumber?: number;
    PageSize?: number;
    SearchQuery?: string;
    floorId?: number;
    buildingId?: number;
    organizationId?: number;
  }): Observable<SectionPaginationData> {
    return this.sectionRepo
      .getPaginatedSections(filters)
      .pipe(map((resp) => resp.data));
  }

  getSectionById(id: number): Observable<Section> {
    return this.sectionRepo.getSectionById(id).pipe(map((resp) => resp.data));
  }

  createSection(section: CreateEditSectionModel): Observable<Section> {
    return this.sectionRepo
      .createSection(section)
      .pipe(map((resp) => resp.data));
  }

  updateSection(section: CreateEditSectionModel): Observable<Section> {
    return this.sectionRepo.editSection(section).pipe(map((resp) => resp.data));
  }

  softDeleteSection(id: number): Observable<void> {
    return this.sectionRepo.deleteSection(id).pipe(map((resp) => {}));
  }

  restoreSection(id: number): Observable<void> {
    return this.sectionRepo.restoreSection(id).pipe(map((resp) => {}));
  }

  forceDeleteSection(id: number): Observable<void> {
    return this.sectionRepo.forceDeleteSection(id).pipe(map((resp) => {}));
  }

  getDeletedSections(): Observable<Section[]> {
    return this.sectionRepo.getDeletedSections().pipe(map((resp) => resp.data));
  }

  /**
   * ✅ Fetch section tree including points (like getOrganizationTreeById)
   */
  getSectionTreeById(id: number): Observable<any> {
    return this.sectionRepo.getSectionTreeById(id).pipe(map((resp) => resp));
  }

  /**
   * جلب الأقسام بناءً على معرف الطابق (floorId)
   */
  getSectionsByFloor(floorId: number): Observable<Section[]> {
    return this.sectionRepo
      .getSectionsByFloor(floorId)
      .pipe(map((resp) => resp.data));
  }

  // Get section along with user shifts by section ID
  getSectionWithUserShift(sectionId: string | number): Observable<any> {
    return this.sectionRepo
      .getSectionWithUserShift(sectionId)
      .pipe(map((resp) => resp));
  }

  getSectionShift(): Observable<any> {
    return this.sectionRepo.getSectionShift().pipe(map((resp) => resp));
  }

  getAuditorSectionsPaged(filters: {
    PageNumber?: number;
    PageSize?: number;
    SearchQuery?: string;
    floorId?: number;
    buildingId?: number;
    organizationId?: number;
  }): Observable<SectionPaginationData> {
    return this.sectionRepo
      .getAuditorSections(filters)
      .pipe(map((resp) => resp.data));
  }
}
