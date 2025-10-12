// sensor-filter.component.ts
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PageTitleComponent } from '../../page-title/page-title.component';
import { FilterBarService } from '../../../services/filter-bar.service';
import { Application } from '../../../../features/admin/models/sensor.model';
import { SensorService } from '../../../../features/admin/services/sensor.service';

interface DropdownItem {
  id: number | string;
  name: string;
}

interface DeviceFilters {
  pageNumber?: number;
  pageSize?: number;
  searchQuery?: string;
  applicationId?: number | null;
  organizationId?: number | null;
  buildingId?: number | null;
  floorId?: number | null;
  sectionId?: number | null;
  pointId?: number | null;
  isActive?: boolean | null;
  minBattery?: number;
  maxBattery?: number;
  isAssign?: boolean | null;
}

@Component({
  selector: 'app-sensor-filter',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './sensor-filter.component.html',
  styleUrls: ['./sensor-filter.component.scss'],
})
export class SensorFilterComponent implements OnInit {
  // Input properties from parent component
  @Input() isActive: boolean | undefined = undefined;
  @Input() selectedApplicationId: number | null = null;
  @Input() minValue: number = 0;
  @Input() maxValue: number = 100;
  @Input() selectedOrganization: number | null = null;
  @Input() selectedBuilding: number | null = null;
  @Input() selectedFloor: number | null = null;
  @Input() selectedsection: number | null = null;
  @Input() selectedPoint: number | null = null;

  // Output events for parent component
  @Output() filterChange = new EventEmitter<DeviceFilters>();
  @Output() close = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();

  // Data options
  applications: Application[] = [];
  organizations: DropdownItem[] = [];
  buildings: DropdownItem[] = [];
  floors: DropdownItem[] = [];
  sections: DropdownItem[] = [];
  points: DropdownItem[] = [];

  isLoadingOrganizations = false;

  constructor(
    private filterService: FilterBarService,
    private sensorService: SensorService
  ) {}

  ngOnInit(): void {
    this.loadApplications();
    this.loadOrganizations();
  }

  loadApplications(): void {
    this.sensorService.getApplications().subscribe({
      next: (apps) => {
        if (apps) {
          this.applications = apps;
        }
      },
      error: (err) => console.error('Error loading applications:', err),
    });
  }

  loadOrganizations(): void {
    this.filterService.loadOrganizationsPaged(1).subscribe({
      next: (orgs) => (this.organizations = orgs),
      error: (err) => console.error('Error loading organizations:', err),
    });
  }

  /**
   * Handle organization selection change
   */
  onOrganizationChange(): void {
    if (this.selectedOrganization) {
      this.filterService
        .loadBuildingsByOrganization(this.selectedOrganization)
        .subscribe((buildings) => (this.buildings = buildings));
    } else {
      this.buildings = [];
    }
    this.resetFromBuildingDown();
  }

  /**
   * Handle building selection change
   */
  onBuildingChange(): void {
    if (this.selectedBuilding) {
      this.filterService
        .loadFloorsByBuilding(this.selectedBuilding)
        .subscribe((floors) => (this.floors = floors));
    } else {
      this.floors = [];
    }
    this.resetFromFloorDown();
  }

  /**
   * Handle floor selection change
   */
  onFloorChange(): void {
    if (this.selectedFloor) {
      this.filterService
        .loadSectionsByFloor(this.selectedFloor)
        .subscribe((sections) => (this.sections = sections));
    } else {
      this.sections = [];
    }
    this.resetFromSectionDown();
  }

  /**
   * Handle section selection change
   */
  onSectionChange(): void {
    if (this.selectedsection) {
      this.filterService
        .loadPointsBySection(this.selectedsection)
        .subscribe((points) => (this.points = points));
    } else {
      this.points = [];
    }
    this.selectedPoint = null;
  }

  private resetFromBuildingDown(): void {
    this.selectedBuilding = null;
    this.selectedFloor = null;
    this.selectedsection = null;
    this.selectedPoint = null;
    this.floors = [];
    this.sections = [];
    this.points = [];
  }

  private resetFromFloorDown(): void {
    this.selectedFloor = null;
    this.selectedsection = null;
    this.selectedPoint = null;
    this.sections = [];
    this.points = [];
  }

  private resetFromSectionDown(): void {
    this.selectedsection = null;
    this.selectedPoint = null;
    this.points = [];
  }

  /**
   * Close the filter modal
   */
  closeFilterModal(): void {
    this.close.emit();
  }

  /**
   * Reset all filters
   */
  resetFilters(): void {
    this.isActive = undefined;
    this.selectedApplicationId = null;
    this.minValue = 0;
    this.maxValue = 100;
    this.selectedOrganization = null;
    this.resetFromBuildingDown();
    this.reset.emit();
  }

  /**
   * Apply the selected filters
   */
  applyFilter(): void {
    const filterData: DeviceFilters = {
      pageNumber: 1,
      pageSize: 6,
      applicationId: this.selectedApplicationId,
      organizationId: this.selectedOrganization,
      buildingId: this.selectedBuilding,
      floorId: this.selectedFloor,
      sectionId: this.selectedsection,
      pointId: this.selectedPoint,
      isActive: this.isActive,
      minBattery: this.minValue,
      maxBattery: this.maxValue,
    };
    this.filterChange.emit(filterData);
  }
}
