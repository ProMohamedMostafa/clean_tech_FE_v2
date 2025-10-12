import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FilterBarService } from '../../../services/filter-bar.service';

interface DropdownItem {
  id: number;
  name: string;
}

@Component({
  selector: 'app-leaves-filter',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './leaves-filter.component.html',
  styleUrl: './leaves-filter.component.scss',
})
export class LeavesFilterComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() filterChange = new EventEmitter<any>();

  // Flag for small screen detection
  isSmallScreen: boolean = false;

  // Available filter levels for hierarchical filtering
  levels: string[] = [
    'area',
    'city',
    'Organization',
    'Building',
    'Floor',
    'Section',
    'Point',
  ];

  // Filter selection properties
  selectedRole: string | null = null;
  selectedStatus: string | null = null;
  selectedLevel: string = '';
  selectedCountry: string | null = null;
  selectedArea: number | null = null;
  selectedCity: number | null = null;
  selectedOrganization: number | null = null;
  selectedBuilding: number | null = null;
  selectedFloor: number | null = null;
  selectedSection: number | null = null;
  selectedPoint: number | null = null;

  // Date filters
  dateFrom: string | null = null;
  dateTo: string | null = null;

  // Data collections
  roles: any[] = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Manager' },
    { id: 3, name: 'Supervisor' },
    { id: 4, name: 'Cleaner' },
  ];
  statuses: any[] = [
    { id: 'pending', name: 'Pending' },
    { id: 'approved', name: 'Approved' },
    { id: 'rejected', name: 'Rejected' },
  ];
  countries: any[] = [];
  areas: DropdownItem[] = [];
  cities: DropdownItem[] = [];
  organizations: DropdownItem[] = [];
  buildings: DropdownItem[] = [];
  floors: DropdownItem[] = [];
  sections: DropdownItem[] = [];
  points: DropdownItem[] = [];

  // Loading states
  loadError: boolean = false;
  loadingAreas: boolean = false;
  loadingCities: boolean = false;
  loadingOrganizations: boolean = false;
  loadingBuildings: boolean = false;
  loadingFloors: boolean = false;
  loadingSections: boolean = false;
  loadingPoints: boolean = false;

  constructor(private filterBarService: FilterBarService) {}

  ngOnInit(): void {
    this.loadCountries();
    this.updateScreenSize();
    window.addEventListener('resize', this.updateScreenSize.bind(this));
  }

  // UI Helper Methods
  updateScreenSize(): void {
    this.isSmallScreen = window.innerWidth <= 768;
  }

  hasActiveFilters(): boolean {
    return !!(
      this.dateFrom ||
      this.dateTo ||
      this.selectedRole ||
      this.selectedStatus ||
      this.selectedCountry ||
      this.selectedArea ||
      this.selectedCity ||
      this.selectedOrganization ||
      this.selectedBuilding ||
      this.selectedFloor ||
      this.selectedSection ||
      this.selectedPoint
    );
  }

  // Filter Management Methods
  resetFilters(): void {
    this.dateFrom = null;
    this.dateTo = null;
    this.selectedRole = null;
    this.selectedStatus = null;
    this.selectedCountry = null;
    this.selectedArea = null;
    this.selectedCity = null;
    this.selectedOrganization = null;
    this.selectedBuilding = null;
    this.selectedFloor = null;
    this.selectedSection = null;
    this.selectedPoint = null;
  }

  emitFilterData(): void {
    const filterData = {
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      selectedRole: this.selectedRole,
      selectedStatus: this.selectedStatus,
      selectedCountry: this.selectedCountry,
      selectedArea: this.selectedArea,
      selectedCity: this.selectedCity,
      selectedOrganization: this.selectedOrganization,
      selectedBuilding: this.selectedBuilding,
      selectedFloor: this.selectedFloor,
      selectedSection: this.selectedSection,
      selectedPoint: this.selectedPoint,
    };
    this.filterChange.emit(filterData);
  }

  // Data Loading Methods
  loadCountries(): void {
    this.filterBarService.loadNationalities().subscribe({
      next: (data) => {
        this.countries = data;
      },
      error: (err) => {
        console.error('Error fetching countries:', err);
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

  // Event Handlers
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
    if (this.selectedSection) {
      this.loadPointsBySection(this.selectedSection);
      this.resetPoints();
    } else {
      this.resetFromSectionDown();
    }
  }

  // Modal Control Methods
  closeFilterModal(): void {
    this.close.emit();
  }

  applyFilter(): void {
    this.emitFilterData();
    this.close.emit();
  }

  // Private Helper Methods
  private resetAllLevels(): void {
    this.selectedArea = null;
    this.selectedCity = null;
    this.selectedOrganization = null;
    this.selectedBuilding = null;
    this.selectedFloor = null;
    this.selectedSection = null;
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
    this.selectedSection = null;
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
    this.selectedSection = null;
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
    this.selectedSection = null;
    this.selectedPoint = null;
    this.buildings = [];
    this.floors = [];
    this.sections = [];
    this.points = [];
  }

  private resetFromBuildingDown(): void {
    this.selectedFloor = null;
    this.selectedSection = null;
    this.selectedPoint = null;
    this.floors = [];
    this.sections = [];
    this.points = [];
  }

  private resetFromFloorDown(): void {
    this.selectedSection = null;
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
}
