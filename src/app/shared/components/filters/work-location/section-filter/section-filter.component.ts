import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FilterBarService } from '../../../../services/filter-bar.service';
import { PageTitleComponent } from "../../../page-title/page-title.component";

@Component({
  selector: 'app-section-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PageTitleComponent],
  templateUrl: './section-filter.component.html',
  styleUrl: '../area-filter/area-filter.component.scss',
})
export class SectionFilterComponent implements OnInit {
  // Input properties from parent component
  @Input() selectedBuilding: string | null = null;
  @Input() selectedFloor: string | null = null;

  // Output events for parent component
  @Output() filterChange = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  // Component state variables
  buildings: any[] = [];
  floors: any[] = [];
  isLoadingBuildings = false;
  isLoadingFloors = false;

  constructor(private filterBarService: FilterBarService) {}

  ngOnInit(): void {
    this.loadAllBuildings();

    // If building is already selected, load its floors
    if (this.selectedBuilding) {
      this.loadFloorsByBuilding(+this.selectedBuilding);
    }
  }

  /**
   * Load all available buildings
   */
  loadAllBuildings(): void {
    this.isLoadingBuildings = true;
    this.filterBarService.loadBuildingsPaged().subscribe({
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
   * Load floors by selected building
   * @param buildingId The ID of the selected building
   */
  loadFloorsByBuilding(buildingId: number): void {
    this.isLoadingFloors = true;
    this.floors = []; // Clear previous floors
    this.selectedFloor = null; // Reset floor selection

    this.filterBarService.loadFloorsByBuilding(buildingId).subscribe({
      next: (floors) => {
        this.floors = floors;
        this.isLoadingFloors = false;
      },
      error: (error) => {
        console.error('Error fetching floors:', error);
        this.floors = [];
        this.isLoadingFloors = false;
      },
    });
  }

  /**
   * Handle building selection change
   */
  onBuildingChange(event: Event): void {
    const buildingId = (event.target as HTMLSelectElement).value;
    this.selectedBuilding = buildingId || null;

    if (this.selectedBuilding) {
      this.loadFloorsByBuilding(+this.selectedBuilding);
    } else {
      this.floors = [];
      this.selectedFloor = null;
    }
  }

  /**
   * Handle floor selection change
   */
  onFloorChange(event: Event): void {
    this.selectedFloor = (event.target as HTMLSelectElement).value || null;
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
      selectedBuilding: this.selectedBuilding,
      selectedFloor: this.selectedFloor,
    };
    this.filterChange.emit(filterData);
  }
}
