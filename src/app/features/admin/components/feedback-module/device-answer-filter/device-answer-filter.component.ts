// feedback-filter.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { FilterBarService } from '../../../../../shared/services/filter-bar.service';

@Component({
  selector: 'app-device-answer-filter',
  imports: [CommonModule, TranslateModule, FormsModule],
  templateUrl: './device-answer-filter.component.html',
  styleUrl: './device-answer-filter.component.scss',
})
export class DeviceAnswerFilterComponent {
  @Output() filterChange = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  filterData: any = {
    selectedDate: '',
    selectedBuilding: undefined,
    selectedFloor: undefined,
    selectedSection: undefined,
  };

  buildings: any[] = [];
  floors: any[] = [];
  sections: any[] = [];
  isLoadingBuildings = false;
  isLoadingFloors = false;
  isLoadingSections = false;

  constructor(private filterBarService: FilterBarService) {}

  ngOnInit(): void {
    this.loadBuildings();
    this.loadFloors();
    this.loadSections();
  }

  loadBuildings(): void {
    this.isLoadingBuildings = true;
    this.filterBarService.loadBuildingsPaged(1, 1000).subscribe({
      next: (buildings) => {
        this.buildings = buildings;
        this.isLoadingBuildings = false;
      },
      error: () => {
        this.isLoadingBuildings = false;
      },
    });
  }

  loadFloors(): void {
    this.isLoadingFloors = true;
    this.filterBarService.loadFloorsPaged(1, 1000).subscribe({
      next: (floors) => {
        this.floors = floors;
        this.isLoadingFloors = false;
      },
      error: () => {
        this.isLoadingFloors = false;
      },
    });
  }

  loadSections(): void {
    this.isLoadingSections = true;
    this.filterBarService.loadSectionsPaged(1, 1000).subscribe({
      next: (sections) => {
        this.sections = sections;
        this.isLoadingSections = false;
      },
      error: () => {
        this.isLoadingSections = false;
      },
    });
  }

  onBuildingChange(): void {
    if (this.filterData.selectedBuilding) {
      this.isLoadingFloors = true;
      this.filterBarService
        .loadFloorsByBuilding(this.filterData.selectedBuilding)
        .subscribe({
          next: (floors) => {
            this.floors = floors;
            this.isLoadingFloors = false;
            this.filterData.selectedFloor = undefined;
            this.onFloorChange();
          },
          error: () => {
            this.isLoadingFloors = false;
          },
        });
    } else {
      this.loadFloors();
    }
  }

  onFloorChange(): void {
    if (this.filterData.selectedFloor) {
      this.isLoadingSections = true;
      this.filterBarService
        .loadSectionsByFloor(this.filterData.selectedFloor)
        .subscribe({
          next: (sections) => {
            this.sections = sections;
            this.isLoadingSections = false;
            this.filterData.selectedSection = undefined;
          },
          error: () => {
            this.isLoadingSections = false;
          },
        });
    } else {
      this.loadSections();
    }
  }

  applyFilters(): void {
    // Emit the filter data in the exact format that buildFilters() expects
    const filters = {
      selectedDate: this.filterData.selectedDate || '',
      selectedBuilding:
        this.filterData.selectedBuilding === null
          ? undefined
          : this.filterData.selectedBuilding,
      selectedFloor:
        this.filterData.selectedFloor === null
          ? undefined
          : this.filterData.selectedFloor,
      selectedSection:
        this.filterData.selectedSection === null
          ? undefined
          : this.filterData.selectedSection,
    };
    this.filterChange.emit(filters);
  }

  resetFilters(): void {
    this.filterData = {
      selectedDate: '',
      selectedBuilding: undefined,
      selectedFloor: undefined,
      selectedSection: undefined,
    };
    this.loadBuildings();
    this.loadFloors();
    this.loadSections();
  }

  closeModal(): void {
    this.close.emit();
  }
}
