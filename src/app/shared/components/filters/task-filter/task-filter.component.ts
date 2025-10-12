import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FilterBarService } from '../../../services/filter-bar.service';

interface DropdownItem {
  id: number | string;
  name: string;
}

@Component({
  selector: 'app-task-filter',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './task-filter.component.html',
  styleUrl: './task-filter.component.scss',
})
export class TaskFilterComponent implements OnInit {
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() filterChange = new EventEmitter<any>();

  // Screen size detection
  isSmallScreen: boolean = false;

  // Location hierarchy levels
  levels: string[] = [
    'country',
    'area',
    'city',
    'Organization',
    'Building',
    'Floor',
    'Section',
    'Point',
  ];

  // Filter selections
  selectedCreatedBy: number | null = null;
  selectedAssignedTo: number | null = null;
  selectedStatus: string | null = null;
  selectedPriority: string | null = null;
  selectedLevel: string = '';
  selectedCountry: string | null = null;
  selectedArea: number | null = null;
  selectedCity: number | null = null;
  selectedOrganization: number | null = null;
  selectedBuilding: number | null = null;
  selectedFloor: number | null = null;
  selectedSection: number | null = null;
  selectedPoint: number | null = null;
  selectedProvider: number | null = null;

  // Date/time filters
  startDate: string | null = null;
  endDate: string | null = null;
  startTime: string | null = null;
  endTime: string | null = null;

  // Data collections
  creators: DropdownItem[] = [];
  assignees: DropdownItem[] = [];
  statuses: DropdownItem[] = [
    { id: 'open', name: 'Open' },
    { id: 'in_progress', name: 'In Progress' },
    { id: 'completed', name: 'Completed' },
    { id: 'closed', name: 'Closed' },
  ];
  priorities: DropdownItem[] = [
    { id: 'high', name: 'High' },
    { id: 'medium', name: 'Medium' },
    { id: 'low', name: 'Low' },
  ];
  providers: DropdownItem[] = [];
  countries: any[] = [];
  areas: DropdownItem[] = [];
  cities: DropdownItem[] = [];
  organizations: DropdownItem[] = [];
  buildings: DropdownItem[] = [];
  floors: DropdownItem[] = [];
  sections: DropdownItem[] = [];
  points: DropdownItem[] = [];

  // Loading states
  loadingCreators: boolean = false;
  loadingAssignees: boolean = false;
  loadingProviders: boolean = false;
  loadingAreas: boolean = false;
  loadingCities: boolean = false;
  loadingOrganizations: boolean = false;
  loadingBuildings: boolean = false;
  loadingFloors: boolean = false;
  loadingSections: boolean = false;
  loadingPoints: boolean = false;

  constructor(private filterBarService: FilterBarService) {}

  ngOnInit(): void {
    this.loadInitialData();
    this.updateScreenSize();
    window.addEventListener('resize', this.updateScreenSize.bind(this));
  }

  private loadInitialData(): void {
    this.loadCreators();
    this.loadAssignees();
    this.loadProviders();
    this.loadCountries();
  }

  private updateScreenSize(): void {
    this.isSmallScreen = window.innerWidth <= 768;
  }

  // User data loading
  private loadCreators(): void {
    this.loadingCreators = true;
    this.filterBarService.loadPaginatedUsers(1, 100).subscribe({
      next: (response) => {
        this.creators = response.data.data.map((user: any) => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
        }));
        this.loadingCreators = false;
      },
      error: (err) => {
        console.error('Error fetching creators:', err);
        this.loadingCreators = false;
      },
    });
  }

  private loadAssignees(): void {
    this.loadingAssignees = true;
    this.filterBarService.loadPaginatedUsers(1, 100).subscribe({
      next: (response) => {
        this.assignees = response.data.data.map((user: any) => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
        }));
        this.loadingAssignees = false;
      },
      error: (err) => {
        console.error('Error fetching assignees:', err);
        this.loadingAssignees = false;
      },
    });
  }

  // Provider data loading
  private loadProviders(): void {
    this.loadingProviders = true;
    this.filterBarService.loadProviders().subscribe({
      next: (providers) => {
        this.providers = providers;
        this.loadingProviders = false;
      },
      error: (err) => {
        console.error('Error fetching providers:', err);
        this.loadingProviders = false;
      },
    });
  }

  // Location hierarchy loading
  private loadCountries(): void {
    this.filterBarService.loadNationalities().subscribe({
      next: (countries) => {
        this.countries = countries;
      },
      error: (err) => {
        console.error('Error fetching countries:', err);
      },
    });
  }

  private loadAreasByCountry(countryName: string): void {
    this.loadingAreas = true;
    this.filterBarService.loadAreasByCountry(countryName).subscribe({
      next: (areas) => {
        this.areas = areas;
        this.loadingAreas = false;
      },
      error: (err) => {
        console.error('Error fetching areas:', err);
        this.loadingAreas = false;
      },
    });
  }

  private loadCitiesByArea(areaId: number): void {
    this.loadingCities = true;
    this.filterBarService.loadCitiesByArea(areaId).subscribe({
      next: (cities) => {
        this.cities = cities;
        this.loadingCities = false;
      },
      error: (err) => {
        console.error('Error fetching cities:', err);
        this.loadingCities = false;
      },
    });
  }

  private loadOrganizationsByCity(cityId: number): void {
    this.loadingOrganizations = true;
    this.filterBarService.loadOrganizationsByCity(cityId).subscribe({
      next: (organizations) => {
        this.organizations = organizations;
        this.loadingOrganizations = false;
      },
      error: (err) => {
        console.error('Error fetching organizations:', err);
        this.loadingOrganizations = false;
      },
    });
  }

  private loadBuildingsByOrganization(organizationId: number): void {
    this.loadingBuildings = true;
    this.filterBarService
      .loadBuildingsByOrganization(organizationId)
      .subscribe({
        next: (buildings) => {
          this.buildings = buildings;
          this.loadingBuildings = false;
        },
        error: (err) => {
          console.error('Error fetching buildings:', err);
          this.loadingBuildings = false;
        },
      });
  }

  private loadFloorsByBuilding(buildingId: number): void {
    this.loadingFloors = true;
    this.filterBarService.loadFloorsByBuilding(buildingId).subscribe({
      next: (floors) => {
        this.floors = floors;
        this.loadingFloors = false;
      },
      error: (err) => {
        console.error('Error fetching floors:', err);
        this.loadingFloors = false;
      },
    });
  }

  private loadSectionsByFloor(floorId: number): void {
    this.loadingSections = true;
    this.filterBarService.loadSectionsByFloor(floorId).subscribe({
      next: (sections) => {
        this.sections = sections;
        this.loadingSections = false;
      },
      error: (err) => {
        console.error('Error fetching sections:', err);
        this.loadingSections = false;
      },
    });
  }

  private loadPointsBySection(sectionId: number): void {
    this.loadingPoints = true;
    this.filterBarService.loadPointsBySection(sectionId).subscribe({
      next: (points) => {
        this.points = points;
        this.loadingPoints = false;
      },
      error: (err) => {
        console.error('Error fetching points:', err);
        this.loadingPoints = false;
      },
    });
  }

  // Event handlers for location hierarchy
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

  onLevelChange(): void {
    this.resetLocationFilters();
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

  // Reset methods
  private resetLocationFilters(): void {
    this.selectedCountry = null;
    this.selectedArea = null;
    this.selectedCity = null;
    this.selectedOrganization = null;
    this.selectedBuilding = null;
    this.selectedFloor = null;
    this.selectedSection = null;
    this.selectedPoint = null;
  }

  private resetAllLevels(): void {
    this.areas = [];
    this.cities = [];
    this.organizations = [];
    this.buildings = [];
    this.floors = [];
    this.sections = [];
    this.points = [];
  }

  private resetFromAreaDown(): void {
    this.selectedArea = null;
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
    this.selectedCity = null;
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
    this.selectedOrganization = null;
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
    this.selectedBuilding = null;
    this.selectedFloor = null;
    this.selectedSection = null;
    this.selectedPoint = null;
    this.floors = [];
    this.sections = [];
    this.points = [];
  }

  private resetFromFloorDown(): void {
    this.selectedFloor = null;
    this.selectedSection = null;
    this.selectedPoint = null;
    this.sections = [];
    this.points = [];
  }

  private resetFromSectionDown(): void {
    this.selectedSection = null;
    this.selectedPoint = null;
    this.points = [];
  }

  private resetPoints(): void {
    this.selectedPoint = null;
  }

  // Modal control methods
  closeModal(): void {
    this.closeModalEvent.emit();
  }

  applyFilter(): void {
    const filterData = {
      createdBy: this.selectedCreatedBy,
      assignedTo: this.selectedAssignedTo,
      status: this.selectedStatus,
      priority: this.selectedPriority,
      provider: this.selectedProvider,
      startDate: this.startDate,
      endDate: this.endDate,
      startTime: this.startTime,
      endTime: this.endTime,
      country: this.selectedCountry,
      area: this.selectedArea,
      city: this.selectedCity,
      organization: this.selectedOrganization,
      building: this.selectedBuilding,
      floor: this.selectedFloor,
      section: this.selectedSection,
      point: this.selectedPoint,
      level: this.selectedLevel,
    };
    this.filterChange.emit(filterData);
    this.closeModal();
  }

  clearFilters(): void {
    this.selectedCreatedBy = null;
    this.selectedAssignedTo = null;
    this.selectedStatus = null;
    this.selectedPriority = null;
    this.selectedProvider = null;
    this.startDate = null;
    this.endDate = null;
    this.startTime = null;
    this.endTime = null;
    this.selectedLevel = '';
    this.resetLocationFilters();
    this.resetAllLevels();
  }
}
