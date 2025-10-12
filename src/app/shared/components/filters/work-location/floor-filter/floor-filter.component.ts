import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FilterBarService } from '../../../../services/filter-bar.service';
import { PageTitleComponent } from '../../../page-title/page-title.component';

@Component({
  selector: 'app-floor-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PageTitleComponent],
  templateUrl: './floor-filter.component.html',
  styleUrl: '../area-filter/area-filter.component.scss',
})
export class FloorFilterComponent implements OnInit {
  // Input properties from parent component
  @Input() selectedOrganization: string | null = null;
  @Input() selectedBuilding: string | null = null;

  // Output events for parent component
  @Output() filterChange = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  // Component state variables
  organizations: any[] = [];
  buildings: any[] = [];
  isLoadingOrganizations = false;
  isLoadingBuildings = false;

  constructor(private filterBarService: FilterBarService) {}

  ngOnInit(): void {
    this.loadAllOrganizations();

    // If organization is already selected, load its buildings
    if (this.selectedOrganization) {
      this.loadBuildingsByOrganization(+this.selectedOrganization);
    }
  }

  /**
   * Load all available organizations
   */
  loadAllOrganizations(): void {
    this.isLoadingOrganizations = true;
    this.filterBarService.loadOrganizationsPaged().subscribe({
      next: (organizations) => {
        this.organizations = organizations;
        this.isLoadingOrganizations = false;
      },
      error: (error) => {
        console.error('Error fetching organizations:', error);
        this.organizations = [];
        this.isLoadingOrganizations = false;
      },
    });
  }

  /**
   * Load buildings by selected organization
   * @param organizationId The ID of the selected organization
   */
  loadBuildingsByOrganization(organizationId: number): void {
    this.isLoadingBuildings = true;
    this.buildings = []; // Clear previous buildings
    this.selectedBuilding = null; // Reset building selection

    this.filterBarService
      .loadBuildingsByOrganization(organizationId)
      .subscribe({
        next: (buildings) => {
          this.buildings = buildings;
          this.isLoadingBuildings = false;
        },
        error: (error) => {
          console.error('Error fetching buildings:', error);
          this.buildings = [];
          this.isLoadingBuildings = false;
        },
      });
  }

  /**
   * Handle organization selection change
   */
  onOrganizationChange(event: Event): void {
    const organizationId = (event.target as HTMLSelectElement).value;
    this.selectedOrganization = organizationId || null;

    if (this.selectedOrganization) {
      this.loadBuildingsByOrganization(+this.selectedOrganization);
    } else {
      this.buildings = [];
      this.selectedBuilding = null;
    }
  }

  /**
   * Handle building selection change
   */
  onBuildingChange(event: Event): void {
    this.selectedBuilding = (event.target as HTMLSelectElement).value || null;
  }

  /**
   * Close the filter modal
   */
  closeFilterModal(): void {
    this.close.emit();
  }

  /**
   * Apply the selected filters
   */
  applyFilter(): void {
    const filterData = {
      selectedOrganization: this.selectedOrganization,
      selectedBuilding: this.selectedBuilding,
    };
    this.filterChange.emit(filterData);
  }
}
