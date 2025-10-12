import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FilterBarService } from '../../../services/filter-bar.service';
import { getUserRole } from '../../../../core/helpers/auth.helpers';

interface Country {
  name: string;
}

interface DropdownItem {
  id: number;
  name: string;
}

@Component({
  selector: 'app-user-filter',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './user-filter.component.html',
  styleUrl: './user-filter.component.scss',
})
export class UserFilterComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  currentUserRole: string = '';

  //#region Input/Output Properties
  /** Output: Emits filter data when filters change */
  @Output() filterChange = new EventEmitter<any>();
  //#endregion

  //#region UI State Properties
  /** Flag for small screen detection */
  isSmallScreen: boolean = false;

  /** Available filter levels for hierarchical filtering */
  levels: string[] = [
    'area',
    'city',
    'Organization',
    'Building',
    'Floor',
    'Section',
    'Point',
  ];
  //#endregion

  //#region Filter Selection Properties
  /** Currently selected filter level */
  selectedLevel: string = '';

  /** Currently selected country */
  selectedCountry: string | null = null;

  /** Currently selected area */
  selectedArea: number | null = null;

  /** Currently selected city */
  selectedCity: number | null = null;

  /** Currently selected organization */
  selectedOrganization: number | null = null;

  /** Currently selected building */
  selectedBuilding: number | null = null;

  /** Currently selected floor */
  selectedFloor: number | null = null;

  /** Currently selected section */
  selectedsection: number | null = null;

  /** Currently selected point */
  selectedPoint: number | null = null;

  /** Currently selected nationality */
  selectedNationality: string | null = null;

  /** Currently selected provider */
  selectedProvider: string | null = null;

  /** Currently selected role */
  selectedRole: string | null = null;

  /** Currently selected gender */
  selectedGender: number | null = null;
  //#endregion

  //#region Data Collections
  /** List of countries */
  countries: Country[] = [];

  /** List of providers */
  providers: any[] = [];

  /** List of areas */
  areas: DropdownItem[] = [];

  /** List of cities */
  cities: DropdownItem[] = [];

  /** List of organizations */
  organizations: DropdownItem[] = [];

  /** List of buildings */
  buildings: DropdownItem[] = [];

  /** List of floors */
  floors: DropdownItem[] = [];

  /** List of sections */
  sections: DropdownItem[] = [];

  /** List of points */
  points: DropdownItem[] = [];
  //#endregion

  //#region Loading States
  /** Flag indicating if there was an error loading data */
  loadError: boolean = false;

  /** Loading state for providers */
  loadingProviders: boolean = false;

  /** Loading state for areas */
  loadingAreas: boolean = false;

  /** Loading state for cities */
  loadingCities: boolean = false;

  /** Loading state for organizations */
  loadingOrganizations: boolean = false;

  /** Loading state for buildings */
  loadingBuildings: boolean = false;

  /** Loading state for floors */
  loadingFloors: boolean = false;

  /** Loading state for sections */
  loadingSections: boolean = false;

  /** Loading state for points */
  loadingPoints: boolean = false;
  //#endregion

  constructor(private filterBarService: FilterBarService) {}

  isAdmin(): boolean {
    return this.currentUserRole === 'Admin';
  }

  ngOnInit(): void {
    this.currentUserRole = getUserRole();
    this.loadNationalities();
    this.loadProviders();
    this.updateScreenSize();

    window.addEventListener('resize', this.updateScreenSize.bind(this));
  }

  //#region UI Helper Methods
  updateScreenSize(): void {
    this.isSmallScreen = window.innerWidth <= 768;
  }

  hasActiveFilters(): boolean {
    return !!(
      this.selectedCountry ||
      this.selectedArea ||
      this.selectedCity ||
      this.selectedOrganization ||
      this.selectedBuilding ||
      this.selectedFloor ||
      this.selectedsection ||
      this.selectedPoint ||
      this.selectedNationality ||
      this.selectedProvider ||
      this.selectedRole ||
      this.selectedGender
    );
  }
  //#endregion

  //#region Filter Management Methods
  resetLowerLevels(level: string): void {
    if (level === 'country') {
      this.resetAllLevels();
    } else if (level === 'area') {
      this.resetFromAreaDown();
    } else if (level === 'city') {
      this.resetFromCityDown();
    } else if (level === 'organization') {
      this.resetFromOrganizationDown();
    } else if (level === 'building') {
      this.resetFromBuildingDown();
    } else if (level === 'floor') {
      this.resetPoints();
    }
  }

  resetFilters(): void {
    this.selectedCountry = null;
    this.selectedArea = null;
    this.selectedCity = null;
    this.selectedNationality = null;
    this.selectedProvider = null;
    this.selectedRole = null;
    this.selectedGender = null;
    this.selectedOrganization = null;
    this.selectedBuilding = null;
    this.selectedFloor = null;
    this.selectedsection = null;
    this.selectedPoint = null;
  }

  emitFilterData(): void {
    const filterData = {
      selectedCountry: this.selectedCountry,
      selectedArea: this.selectedArea,
      selectedCity: this.selectedCity,
      selectedOrganization: this.selectedOrganization,
      selectedProvider: this.selectedProvider,
      selectedRole: this.selectedRole,
      selectedNationality: this.selectedNationality,
      selectedGender: this.selectedGender,
      selectedBuilding: this.selectedBuilding,
      selectedFloor: this.selectedFloor,
      selectedSection: this.selectedsection,
      selectedPoint: this.selectedPoint,
    };
    this.filterChange.emit(filterData);
  }
  //#endregion

  loadProviders(): void {
    this.loadingProviders = true;
    this.filterBarService.loadProviders().subscribe({
      next: (data) => {
        this.providers = data;
        this.loadingProviders = false;
      },
      error: (error) => {
        console.error('Error fetching providers:', error);
        this.loadingProviders = false;
        this.loadError = true;
      },
    });
  }

  //#region Data Loading Methods (Location Hierarchy)
  loadNationalities(): void {
    this.filterBarService.loadNationalities().subscribe({
      next: (data) => {
        this.countries = data;
      },
      error: (err) => {
        console.error('Error fetching nationalities:', err);
        this.loadError = true;
      },
    });
  }

  loadAreasByCountry(countryName: string): void {
    this.loadingAreas = true;
    this.filterBarService.loadAreasByCountry(countryName).subscribe({
      next: (data) => {
        this.areas = data;
        this.loadingAreas = false;
      },
      error: (error) => {
        console.error('Error fetching areas:', error);
        this.loadingAreas = false;
        this.loadError = true;
      },
    });
  }

  loadCitiesByArea(areaId: number): void {
    this.loadingCities = true;
    this.filterBarService.loadCitiesByArea(areaId).subscribe({
      next: (data) => {
        this.cities = data;
        this.loadingCities = false;
      },
      error: (error) => {
        console.error('Error fetching cities:', error);
        this.loadingCities = false;
        this.loadError = true;
      },
    });
  }

  loadOrganizationsByCity(cityId: number): void {
    this.loadingOrganizations = true;
    this.filterBarService.loadOrganizationsByCity(cityId).subscribe({
      next: (data) => {
        this.organizations = data;
        this.loadingOrganizations = false;
      },
      error: (error) => {
        console.error('Error fetching organizations:', error);
        this.loadingOrganizations = false;
        this.loadError = true;
      },
    });
  }

  loadBuildingsByOrganization(organizationId: number): void {
    this.loadingBuildings = true;
    this.filterBarService
      .loadBuildingsByOrganization(organizationId)
      .subscribe({
        next: (data) => {
          this.buildings = data;
          this.loadingBuildings = false;
        },
        error: (error) => {
          console.error('Error fetching buildings:', error);
          this.loadingBuildings = false;
          this.loadError = true;
        },
      });
  }

  loadFloorsByBuilding(buildingId: number): void {
    this.loadingFloors = true;
    this.filterBarService.loadFloorsByBuilding(buildingId).subscribe({
      next: (data) => {
        this.floors = data;
        this.loadingFloors = false;
      },
      error: (error) => {
        console.error('Error fetching floors:', error);
        this.loadingFloors = false;
        this.loadError = true;
      },
    });
  }

  loadSectionsByFloor(floorId: number): void {
    this.loadingSections = true;
    this.filterBarService.loadSectionsByFloor(floorId).subscribe({
      next: (data) => {
        this.sections = data;
        this.loadingSections = false;
      },
      error: (error) => {
        console.error('Error fetching sections:', error);
        this.loadingSections = false;
        this.loadError = true;
      },
    });
  }

  loadPointsBySection(sectionId: number): void {
    this.loadingPoints = true;
    this.filterBarService.loadPointsBySection(sectionId).subscribe({
      next: (data) => {
        this.points = data;
        this.loadingPoints = false;
      },
      error: (error) => {
        console.error('Error fetching points:', error);
        this.loadingPoints = false;
        this.loadError = true;
      },
    });
  }
  //#endregion

  //#region Event Handlers
  onCountryChange(): void {
    if (this.selectedCountry) {
      this.loadAreasByCountry(this.selectedCountry);
      this.resetFromAreaDown();
    } else {
      this.resetAllLevels();
    }
  }

  onAreaChange(): void {
    if (this.selectedArea) {
      this.loadCitiesByArea(this.selectedArea);
      this.resetFromCityDown();
    } else {
      this.resetFromAreaDown();
    }
  }

  onCityChange(): void {
    if (this.selectedCity) {
      this.loadOrganizationsByCity(this.selectedCity);
      this.resetFromOrganizationDown();
    } else {
      this.resetFromCityDown();
    }
  }

  onLevelChange(): void {
    this.resetFilters();
    if (this.selectedLevel === 'Organization') {
      this.resetFromOrganizationDown();
    } else if (this.selectedLevel === 'Building') {
      this.resetFromBuildingDown();
    } else if (this.selectedLevel === 'Floor') {
      this.resetFromFloorDown();
    } else if (this.selectedLevel === 'Section') {
      this.resetFromSectionDown();
    } else if (this.selectedLevel === 'Point') {
      this.resetPoints();
    }
  }

  onOrganizationChange(): void {
    if (this.selectedOrganization) {
      this.loadBuildingsByOrganization(this.selectedOrganization);
      this.resetFromBuildingDown();
    } else {
      this.resetFromOrganizationDown();
    }
  }

  onBuildingChange(): void {
    if (this.selectedBuilding) {
      this.loadFloorsByBuilding(this.selectedBuilding);
      this.resetFromFloorDown();
    } else {
      this.resetFromBuildingDown();
    }
  }

  onFloorChange(): void {
    if (this.selectedFloor) {
      this.loadSectionsByFloor(this.selectedFloor);
      this.resetFromSectionDown();
    } else {
      this.resetFromFloorDown();
    }
  }

  onSectionChange(): void {
    if (this.selectedsection) {
      this.loadPointsBySection(this.selectedsection);
      this.resetPoints();
    } else {
      this.resetFromSectionDown();
    }
  }

  onProviderChange(): void {
    // Add any specific logic needed when provider changes
    this.emitFilterData();
  }
  //#endregion

  //#region Modal Control Methods
  openFilterModal(): void {
    this.resetFilters();
  }

  closeFilterModal(): void {
    this.close.emit();
  }

  applyFilter(): void {
    this.emitFilterData();
    this.close.emit();
  }
  //#endregion

  //#region Private Helper Methods
  private resetAllLevels(): void {
    this.selectedArea = null;
    this.selectedCity = null;
    this.selectedOrganization = null;
    this.selectedBuilding = null;
    this.selectedFloor = null;
    this.selectedsection = null;
    this.selectedPoint = null;
    this.areas = [];
    this.cities = [];
    this.organizations = [];
    this.buildings = [];
    this.floors = [];
    this.sections = [];
    this.points = [];
  }

  private resetFromAreaDown(): void {
    this.selectedCity = null;
    this.selectedOrganization = null;
    this.selectedBuilding = null;
    this.selectedFloor = null;
    this.selectedsection = null;
    this.selectedPoint = null;
    this.cities = [];
    this.organizations = [];
    this.buildings = [];
    this.floors = [];
    this.sections = [];
    this.points = [];
  }

  private resetFromCityDown(): void {
    this.selectedOrganization = null;
    this.selectedBuilding = null;
    this.selectedFloor = null;
    this.selectedsection = null;
    this.selectedPoint = null;
    this.organizations = [];
    this.buildings = [];
    this.floors = [];
    this.sections = [];
    this.points = [];
  }

  private resetFromOrganizationDown(): void {
    this.selectedBuilding = null;
    this.selectedFloor = null;
    this.selectedsection = null;
    this.selectedPoint = null;
    this.buildings = [];
    this.floors = [];
    this.sections = [];
    this.points = [];
  }

  private resetFromBuildingDown(): void {
    this.selectedFloor = null;
    this.selectedsection = null;
    this.selectedPoint = null;
    this.floors = [];
    this.sections = [];
    this.points = [];
  }

  private resetFromFloorDown(): void {
    this.selectedsection = null;
    this.selectedPoint = null;
    this.sections = [];
    this.points = [];
  }

  private resetFromSectionDown(): void {
    this.selectedPoint = null;
    this.points = [];
  }

  private resetPoints(): void {
    this.selectedPoint = null;
    this.points = [];
  }
  //#endregion
}
