import { Injectable } from '@angular/core';
import { AreaService } from '../../features/admin/services/work-location/area.service';
import { CityService } from '../../features/admin/services/work-location/city.service';
import { OrganizationService } from '../../features/admin/services/work-location/organization.service';
import { BuildingService } from '../../features/admin/services/work-location/building.service';
import { FloorService } from '../../features/admin/services/work-location/floor.service';
import { SectionService } from '../../features/admin/services/work-location/section.service';
import { PointService } from '../../features/admin/services/work-location/point.service';
import { CountryService } from '../../features/admin/services/work-location/country.service';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ProviderService } from '../../features/admin/services/provider.service';
import { UserService } from '../../features/admin/services/user.service';
import {
  UserApiResponse,
  UserPaginationData,
  WorkLocationType,
} from '../../features/admin/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class FilterBarService {
  constructor(
    private countryService: CountryService,
    private areaService: AreaService,
    private cityService: CityService,
    private organizationService: OrganizationService,
    private buildingService: BuildingService,
    private floorService: FloorService,
    private sectionService: SectionService,
    private pointService: PointService,
    private providerService: ProviderService,
    private userService: UserService
  ) {}

  // ------------------
  // User Methods
  // ------------------

  /**
   * Load paginated users with optional filters including new fields
   */
  loadPaginatedUsers(
    pageNumber: number = 1,
    pageSize: number = 10,
    search?: string,
    nationality?: string,
    country?: string,
    roleId?: number,
    gender?: number,
    providerId?: number,
    areaId?: number,
    cityId?: number,
    organizationId?: number,
    buildingId?: number,
    floorId?: number,
    sectionId?: number,
    pointId?: number,
    type?: WorkLocationType,
    typeIds?: number[],
    shiftIds?: number[]
  ): Observable<UserApiResponse<UserPaginationData>> {
    return this.userService.getUsersWithPagination({
      PageNumber: pageNumber,
      PageSize: pageSize,
      Search: search,
      Nationality: nationality,
      Country: country,
      RoleId: roleId,
      Gender: gender,
      ProviderId: providerId,
      AreaId: areaId,
      CityId: cityId,
      OrganizationId: organizationId,
      BuildingId: buildingId,
      FloorId: floorId,
      SectionId: sectionId,
      PointId: pointId,
      Type: type,
      TypeIds: typeIds,
      ShiftIds: shiftIds,
    });
  }

  // ------------------------
  // Countries & Nationalities
  // ------------------------
  loadNationalities(): Observable<any[]> {
    return this.countryService.getNationalities().pipe(
      map((res) => res.data),
      catchError((err) => {
        console.error('Error fetching nationalities:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Load countries for location hierarchy
   */
  loadCountriesForLocationHierarchy(): Observable<any[]> {
    return this.countryService.getNationalities().pipe(
      map((res) => {
        return res.data.map((country: any) => ({
          id: country.name, // Use name as ID for country selection
          name: country.name,
        }));
      }),
      catchError((err) => {
        console.error('Error fetching countries for hierarchy:', err);
        return throwError(() => err);
      })
    );
  }

  // -------------
  // Area Methods
  // -------------
  /**
   * Load paginated list of areas with optional filtering
   */
  loadPaginatedAreas(
    pageNumber: number = 1,
    pageSize?: number,
    searchQuery?: string,
    country?: string
  ): Observable<any[]> {
    return this.areaService
      .getPaginatedAreas({
        PageNumber: pageNumber,
        PageSize: pageSize,
        SearchQuery: searchQuery,
        Country: country,
      })
      .pipe(
        map((response) =>
          response.data.map((area: any) => ({
            id: area.id,
            name: area.name,
          }))
        )
      );
  }

  /**
   * Load all areas filtered by country name
   */
  loadAreasByCountry(countryName: string): Observable<any[]> {
    return this.areaService.getAreasByCountry(countryName).pipe(
      map((response: any) =>
        response.data
          .filter((area: any) => area.id !== undefined)
          .map((area: any) => ({
            id: area.id!,
            name: area.name,
          }))
      ),
      catchError((err) => {
        console.error('Error loading areas by country:', err);
        return throwError(() => err);
      })
    );
  }

  // -------------
  // City Methods
  // -------------
  /**
   * Load paginated cities with optional filters
   */
  loadCitiesPaged(
    pageNumber: number = 1,
    pageSize?: number,
    searchQuery?: string,
    areaId?: number,
    country?: string
  ): Observable<any[]> {
    return this.cityService
      .getCitiesPaged({
        PageNumber: pageNumber,
        PageSize: pageSize,
        SearchQuery: searchQuery,
        area: areaId!,
        Country: country,
      })
      .pipe(
        map((data) =>
          data.data.map((city: any) => ({
            id: city.id,
            name: city.name,
          }))
        )
      );
  }

  /**
   * Load all cities under a specific area
   */
  loadCitiesByArea(areaId: number): Observable<any[]> {
    return this.cityService.getCitiesByArea(areaId).pipe(
      map((response: any) =>
        response.data
          .filter((city: any) => city.id !== undefined)
          .map((city: any) => ({
            id: city.id!,
            name: city.name,
          }))
      ),
      catchError((err) => {
        console.error('Error loading cities by area:', err);
        return throwError(() => err);
      })
    );
  }

  // ------------------
  // Organization Methods
  // ------------------
  /**
   * Load paginated organizations with optional filters
   */
  loadOrganizationsPaged(
    pageNumber: number = 1,
    pageSize?: number,
    searchQuery?: string,
    cityId?: number
  ): Observable<any[]> {
    return this.organizationService
      .getOrganizationsPaged({
        PageNumber: pageNumber,
        PageSize: pageSize,
        SearchQuery: searchQuery,
        city: cityId,
      })
      .pipe(
        map((data) =>
          data.data.map((org: any) => ({
            id: org.id,
            name: org.name,
          }))
        )
      );
  }

  /**
   * Load organizations by city id
   */
  loadOrganizationsByCity(cityId: number): Observable<any[]> {
    return this.organizationService.getOrganizationsByCity(cityId).pipe(
      map((response: any) =>
        response.data
          .filter((org: any) => org.id !== undefined)
          .map((org: any) => ({
            id: org.id!,
            name: org.name,
          }))
      ),
      catchError((err) => {
        console.error('Error loading organizations by city:', err);
        return throwError(() => err);
      })
    );
  }

  // --------------
  // Building Methods
  // --------------
  /**
   * Load paginated buildings with optional filters
   */
  loadBuildingsPaged(
    pageNumber: number = 1,
    pageSize?: number,
    searchQuery?: string,
    organizationId?: number,
    cityId?: number
  ): Observable<any[]> {
    return this.buildingService
      .getBuildingsPaged({
        PageNumber: pageNumber,
        PageSize: pageSize,
        SearchQuery: searchQuery,
        organizationId,
        cityId,
      })
      .pipe(
        map((data) =>
          data.data.map((bld: any) => ({
            id: bld.id,
            name: bld.name,
          }))
        )
      );
  }

  /**
   * Load buildings by organization id
   */
  loadBuildingsByOrganization(organizationId: number): Observable<any[]> {
    return this.buildingService.getBuildingsByOrganization(organizationId).pipe(
      map((response: any) =>
        response.data
          .filter((bld: any) => bld.id !== undefined)
          .map((bld: any) => ({
            id: bld.id!,
            name: bld.name,
          }))
      ),
      catchError((err) => {
        console.error('Error loading buildings by organization:', err);
        return throwError(() => err);
      })
    );
  }

  // -----------
  // Floor Methods
  // -----------
  /**
   * Load paginated floors with optional filters
   */
  loadFloorsPaged(
    pageNumber: number = 1,
    pageSize?: number,
    searchQuery?: string,
    buildingId?: number,
    organizationId?: number
  ): Observable<any[]> {
    return this.floorService
      .getFloorsPaged({
        PageNumber: pageNumber,
        PageSize: pageSize,
        SearchQuery: searchQuery,
        buildingId,
        organizationId,
      })
      .pipe(
        map((data) =>
          data.data.map((floor: any) => ({
            id: floor.id,
            name: floor.name,
          }))
        )
      );
  }

  /**
   * Load floors by building id
   */
  loadFloorsByBuilding(buildingId: number): Observable<any[]> {
    return this.floorService.getFloorsByBuilding(buildingId).pipe(
      map((response: any) =>
        response.data
          .filter((floor: any) => floor.id !== undefined)
          .map((floor: any) => ({
            id: floor.id!,
            name: floor.name,
          }))
      ),
      catchError((err) => {
        console.error('Error loading floors by building:', err);
        return throwError(() => err);
      })
    );
  }

  // --------------
  // Section Methods
  // --------------
  /**
   * Load paginated sections with optional filters
   */
  loadSectionsPaged(
    pageNumber: number = 1,
    pageSize?: number,
    searchQuery?: string,
    floorId?: number,
    buildingId?: number,
    organizationId?: number
  ): Observable<any[]> {
    return this.sectionService
      .getSectionsPaged({
        PageNumber: pageNumber,
        PageSize: pageSize,
        SearchQuery: searchQuery,
        floorId,
        buildingId,
        organizationId,
      })
      .pipe(
        map((data) =>
          data.data.map((section: any) => ({
            id: section.id,
            name: section.name,
          }))
        )
      );
  }

  /**
   * Load sections by floor id
   */
  loadSectionsByFloor(floorId: number): Observable<any[]> {
    return this.sectionService.getSectionsByFloor(floorId).pipe(
      map((response: any) =>
        response.data
          .filter((section: any) => section.id !== undefined)
          .map((section: any) => ({
            id: section.id!,
            name: section.name,
          }))
      ),
      catchError((err) => {
        console.error('Error loading sections by floor:', err);
        return throwError(() => err);
      })
    );
  }

  // -----------
  // Point Methods
  // -----------
  /**
   * Load paginated points with optional filters
   */
  loadPointsPaged(
    pageNumber: number = 1,
    pageSize?: number,
    searchQuery?: string,
    sectionId?: number,
    floorId?: number
  ): Observable<any[]> {
    return this.pointService
      .getPointsPaged({
        PageNumber: pageNumber,
        PageSize: pageSize,
        SearchQuery: searchQuery,
        sectionId,
        floorId,
      })
      .pipe(
        map((data) =>
          data.data.map((point: any) => ({
            id: point.id,
            name: point.name,
          }))
        )
      );
  }

  /**
   * Load points by section id
   */
  loadPointsBySection(sectionId: number): Observable<any[]> {
    return this.pointService.getPointsBySection(sectionId).pipe(
      map((response: any) =>
        response.data
          .filter((point: any) => point.id !== undefined)
          .map((point: any) => ({
            id: point.id!,
            name: point.name,
          }))
      ),
      catchError((err) => {
        console.error('Error loading points by section:', err);
        return throwError(() => err);
      })
    );
  }

  // Provider Methods
  // -------------
  /**
   * Load all providers
   */
  loadProviders(): Observable<any[]> {
    return this.providerService.getProviders().pipe(
      map((response: any) =>
        response.data.data
          .filter((provider: any) => provider.id !== undefined)
          .map((provider: any) => ({
            id: provider.id!,
            name: provider.name,
          }))
      ),
      catchError((err) => {
        console.error('Error fetching providers:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Load paginated providers
   */
  loadPaginatedProviders(
    pageNumber: number = 1,
    pageSize?: number
  ): Observable<any[]> {
    return this.providerService
      .getPaginatedProviders(pageNumber, pageSize)
      .pipe(
        catchError((err) => {
          console.error('Error fetching paginated providers:', err);
          return throwError(() => err);
        })
      );
  }

  // ---------------------
  // Location Utility Methods
  // ---------------------

  /**
   * Get location options based on work location type
   */
  getLocationOptionsByType(
    type: WorkLocationType,
    parentId?: number,
    parentName?: string
  ): Observable<any[]> {
    switch (type) {
      case WorkLocationType.Country:
        return this.loadCountriesForLocationHierarchy();

      case WorkLocationType.Area:
        if (parentName) {
          return this.loadAreasByCountry(parentName);
        }
        return this.loadPaginatedAreas(1, 1000);

      case WorkLocationType.City:
        if (parentId) {
          return this.loadCitiesByArea(parentId);
        }
        return this.loadCitiesPaged(1, 1000);

      case WorkLocationType.Organization:
        if (parentId) {
          return this.loadOrganizationsByCity(parentId);
        }
        return this.loadOrganizationsPaged(1, 1000);

      case WorkLocationType.Building:
        if (parentId) {
          return this.loadBuildingsByOrganization(parentId);
        }
        return this.loadBuildingsPaged(1, 1000);

      case WorkLocationType.Floor:
        if (parentId) {
          return this.loadFloorsByBuilding(parentId);
        }
        return this.loadFloorsPaged(1, 1000);

      case WorkLocationType.Section:
        if (parentId) {
          return this.loadSectionsByFloor(parentId);
        }
        return this.loadSectionsPaged(1, 1000);

      case WorkLocationType.Point:
        if (parentId) {
          return this.loadPointsBySection(parentId);
        }
        return this.loadPointsPaged(1, 1000);

      default:
        return throwError(() => new Error('Invalid work location type'));
    }
  }

  /**
   * Get the hierarchy path for a given work location type
   */
  getLocationHierarchyPath(type: WorkLocationType): string[] {
    const hierarchyMap = {
      [WorkLocationType.Country]: ['country'],
      [WorkLocationType.Area]: ['country', 'area'],
      [WorkLocationType.City]: ['country', 'area', 'city'],
      [WorkLocationType.Organization]: [
        'country',
        'area',
        'city',
        'organization',
      ],
      [WorkLocationType.Building]: [
        'country',
        'area',
        'city',
        'organization',
        'building',
      ],
      [WorkLocationType.Floor]: [
        'country',
        'area',
        'city',
        'organization',
        'building',
        'floor',
      ],
      [WorkLocationType.Section]: [
        'country',
        'area',
        'city',
        'organization',
        'building',
        'floor',
        'section',
      ],
      [WorkLocationType.Point]: [
        'country',
        'area',
        'city',
        'organization',
        'building',
        'floor',
        'section',
        'point',
      ],
    };

    return hierarchyMap[type] || [];
  }

  /**
   * Validate location selection based on type
   */
  validateLocationSelection(
    type: WorkLocationType,
    selectedValues: any
  ): boolean {
    const requiredPath = this.getLocationHierarchyPath(type);
    const lastRequiredLevel = requiredPath[requiredPath.length - 1];

    return !!selectedValues[
      `selected${
        lastRequiredLevel.charAt(0).toUpperCase() + lastRequiredLevel.slice(1)
      }`
    ];
  }
}
