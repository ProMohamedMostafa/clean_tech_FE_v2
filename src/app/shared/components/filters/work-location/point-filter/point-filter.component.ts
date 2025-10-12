import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FilterBarService } from '../../../../services/filter-bar.service';
import { PageTitleComponent } from "../../../page-title/page-title.component";

@Component({
  selector: 'app-point-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PageTitleComponent],
  templateUrl: './point-filter.component.html',
  styleUrl: '../area-filter/area-filter.component.scss',
})
export class PointFilterComponent implements OnInit {
  // Input properties from parent component
  @Input() selectedFloor: string | null = null;
  @Input() selectedSection: string | null = null;

  // Output events for parent component
  @Output() filterChange = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  // Component state variables
  floors: any[] = [];
  sections: any[] = [];
  isLoadingFloors = false;
  isLoadingSections = false;

  constructor(private filterBarService: FilterBarService) {}

  ngOnInit(): void {
    this.loadAllFloors();

    // If floor is already selected, load its sections
    if (this.selectedFloor) {
      this.loadSectionsByFloor(+this.selectedFloor);
    }
  }

  /**
   * Load all available floors
   */
  loadAllFloors(): void {
    this.isLoadingFloors = true;
    this.filterBarService.loadFloorsPaged().subscribe({
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
   * Load sections by selected floor
   * @param floorId The ID of the selected floor
   */
  loadSectionsByFloor(floorId: number): void {
    this.isLoadingSections = true;
    this.sections = []; // Clear previous sections
    this.selectedSection = null; // Reset section selection

    this.filterBarService.loadSectionsByFloor(floorId).subscribe({
      next: (sections) => {
        this.sections = sections;
        this.isLoadingSections = false;
      },
      error: (error) => {
        console.error('Error fetching sections:', error);
        this.sections = [];
        this.isLoadingSections = false;
      },
    });
  }

  /**
   * Handle floor selection change
   */
  onFloorChange(event: Event): void {
    const floorId = (event.target as HTMLSelectElement).value;
    this.selectedFloor = floorId || null;

    if (this.selectedFloor) {
      this.loadSectionsByFloor(+this.selectedFloor);
    } else {
      this.sections = [];
      this.selectedSection = null;
    }
  }

  /**
   * Handle section selection change
   */
  onSectionChange(event: Event): void {
    this.selectedSection = (event.target as HTMLSelectElement).value || null;
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
      selectedFloor: this.selectedFloor,
      selectedSection: this.selectedSection,
    };
    this.filterChange.emit(filterData);
  }
}
