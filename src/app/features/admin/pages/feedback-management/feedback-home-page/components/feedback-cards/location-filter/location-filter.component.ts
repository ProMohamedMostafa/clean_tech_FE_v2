import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FilterBarService } from '../../../../../../../../shared/services/filter-bar.service';

interface Country {
  name: string;
}

interface DropdownItem {
  id: number;
  name: string;
}

@Component({
  selector: 'app-location-filter',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './location-filter.component.html',
  styleUrl: './location-filter.component.scss',
})
export class LocationFilterComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  //#region Input/Output Properties
  /** Output: Emits filter data when filters change */
  @Output() filterChange = new EventEmitter<any>();
  //#endregion

  //#region UI State Properties
  /** Flag for small screen detection */
  isSmallScreen: boolean = false;

  /** Available filter levels for hierarchical filtering */
  levels: string[] = ['area', 'city', 'Organization', 'Building', 'Floor'];
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

  //#endregion

  //#region Data Collections
  /** List of countries */
  countries: Country[] = [];

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

  //#endregion

  //#region Loading States
  /** Flag indicating if there was an error loading data */
  loadError: boolean = false;

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

  //#endregion

  constructor(private filterBarService: FilterBarService) {}

  ngOnInit(): void {
    this.loadAreas();
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
      this.selectedFloor
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
    }
  }

  resetFilters(): void {
    this.selectedCountry = null;
    this.selectedArea = null;
    this.selectedCity = null;
    this.selectedOrganization = null;
    this.selectedBuilding = null;
    this.selectedFloor = null;
  }

  emitFilterData(): void {
    const filterData = {
      selectedCountry: this.selectedCountry,
      selectedArea: this.selectedArea,
      selectedCity: this.selectedCity,
      selectedOrganization: this.selectedOrganization,
      selectedBuilding: this.selectedBuilding,
      selectedFloor: this.selectedFloor,
    };
    this.filterChange.emit(filterData);
  }
  //#endregion

  loadAreas(): void {
    this.loadingAreas = true;
    this.filterBarService.loadPaginatedAreas().subscribe({
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

  //#endregion

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
    } else {
      this.resetFromBuildingDown();
    }
  }

  onFloorChange(): void {
    if (this.selectedFloor) {
    } else {
    }
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
    this.areas = [];
    this.cities = [];
    this.organizations = [];
    this.buildings = [];
    this.floors = [];
  }

  private resetFromAreaDown(): void {
    this.selectedCity = null;
    this.selectedOrganization = null;
    this.selectedBuilding = null;
    this.selectedFloor = null;
    this.cities = [];
    this.organizations = [];
    this.buildings = [];
    this.floors = [];
  }

  private resetFromCityDown(): void {
    this.selectedOrganization = null;
    this.selectedBuilding = null;
    this.selectedFloor = null;
    this.organizations = [];
    this.buildings = [];
    this.floors = [];
  }

  private resetFromOrganizationDown(): void {
    this.selectedBuilding = null;
    this.selectedFloor = null;
    this.buildings = [];
    this.floors = [];
  }

  private resetFromBuildingDown(): void {
    this.selectedFloor = null;
    this.floors = [];
  }

  //#endregion
}
