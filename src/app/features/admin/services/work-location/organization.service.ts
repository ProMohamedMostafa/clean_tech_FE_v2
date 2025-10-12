import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  Organization,
  OrganizationPaginationData,
  OrganizationWithUsers,
  CreateEditOrganizationModel,
  OrganizationTreeResponse,
} from '../../models/work-location/organization.model';

import { OrganizationRepository } from '../../repositories/work-location/organization.repository';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  constructor(private orgRepo: OrganizationRepository) {}

  getOrganizationsPaged(filters: {
    PageNumber?: number;
    PageSize?: number;
    SearchQuery?: string;
    city?: number;
  }): Observable<OrganizationPaginationData> {
    return this.orgRepo
      .getPaginatedOrganizations(filters)
      .pipe(map((resp) => resp.data));
  }

  getOrganizationById(id: number): Observable<Organization> {
    return this.orgRepo.getOrganizationById(id).pipe(map((resp) => resp.data));
  }

  createOrganization(
    org: CreateEditOrganizationModel
  ): Observable<Organization> {
    return this.orgRepo.createOrganization(org).pipe(map((resp) => resp.data));
  }

  updateOrganization(
    org: CreateEditOrganizationModel
  ): Observable<Organization> {
    return this.orgRepo.editOrganization(org).pipe(map((resp) => resp.data));
  }

  softDeleteOrganization(id: number): Observable<void> {
    return this.orgRepo.deleteOrganization(id).pipe(map((resp) => {}));
  }

  restoreOrganization(id: number): Observable<void> {
    return this.orgRepo.restoreOrganization(id).pipe(map((resp) => {}));
  }

  forceDeleteOrganization(id: number): Observable<void> {
    return this.orgRepo.forceDeleteOrganization(id).pipe(map((resp) => {}));
  }

  getDeletedOrganizations(): Observable<Organization[]> {
    return this.orgRepo
      .getDeletedOrganizations()
      .pipe(map((resp) => resp.data));
  }

  getOrganizationWithUsers(id: number): Observable<any> {
    return this.orgRepo
      .getOrganizationWithUsers(id)
      .pipe(map((resp) => resp));
  }

  assignUsersToOrganization(
    organizationId: number,
    userIds: number[]
  ): Observable<void> {
    return this.orgRepo
      .assignUsersToOrganization({ organizationId, userIds })
      .pipe(map(() => {}));
  }

  /**
   * Get full tree of an organization (buildings -> floors -> sections -> points)
   */
  getOrganizationTreeById(id: number): Observable<any> {
    return this.orgRepo.getOrganizationTreeById(id).pipe(map((resp) => resp));
  }

  /**
   * جلب المنظمات بناءً على المدينة
   */
  getOrganizationsByCity(cityId: number): Observable<Organization[]> {
    return this.orgRepo
      .getOrganizationsByCity(cityId)
      .pipe(map((resp) => resp.data));
  }

  getOrganizationWithUserShift(
    organizationId: string | number
  ): Observable<any> {
    return this.orgRepo
      .getOrganizationWithUserShift(organizationId)
      .pipe(map((resp) => resp.data));
  }

  getOrganizationShift(): Observable<any> {
    return this.orgRepo.getOrganizationShift().pipe(map((resp) => resp));
  }
}
