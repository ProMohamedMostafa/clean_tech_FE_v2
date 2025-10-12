import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FilterBarService } from '../../../../services/filter-bar.service';
import { PageTitleComponent } from "../../../page-title/page-title.component";

@Component({
  selector: 'app-organization-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PageTitleComponent],
  templateUrl: './organization-filter.component.html',
  styleUrl: '../area-filter/area-filter.component.scss',
})
export class OrganizationFilterComponent implements OnInit {
  // Input properties from parent component
  @Input() selectedArea: string | null = null;
  @Input() selectedCity: string | null = null;

  // Output events for parent component
  @Output() filterChange = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  // Component state variables
  areas: any[] = [];
  cities: any[] = [];
  isLoadingAreas = false;
  isLoadingCities = false;

  constructor(private filterBarService: FilterBarService) {}

  ngOnInit(): void {
    this.loadAllAreas();

    // If area is already selected, load its cities
    if (this.selectedArea) {
      this.loadCitiesByArea(+this.selectedArea);
    }
  }

  /**
   * Load all available areas
   */
  loadAllAreas(): void {
    this.isLoadingAreas = true;
    this.filterBarService.loadPaginatedAreas().subscribe({
      next: (areas) => {
        this.areas = areas;
        this.isLoadingAreas = false;
      },
      error: (error) => {
        console.error('Error fetching areas:', error);
        this.areas = [];
        this.isLoadingAreas = false;
      },
    });
  }

  /**
   * Load cities by selected area
   * @param areaId The ID of the selected area
   */
  loadCitiesByArea(areaId: number): void {
    this.isLoadingCities = true;
    this.cities = []; // Clear previous cities
    this.selectedCity = null; // Reset city selection

    this.filterBarService.loadCitiesByArea(areaId).subscribe({
      next: (cities) => {
        this.cities = cities;
        this.isLoadingCities = false;
      },
      error: (error) => {
        console.error('Error fetching cities:', error);
        this.cities = [];
        this.isLoadingCities = false;
      },
    });
  }

  /**
   * Handle area selection change
   */
  onAreaChange(event: Event): void {
    const areaId = (event.target as HTMLSelectElement).value;
    this.selectedArea = areaId || null;

    if (this.selectedArea) {
      this.loadCitiesByArea(+this.selectedArea);
    } else {
      this.cities = [];
      this.selectedCity = null;
    }
  }

  /**
   * Handle city selection change
   */
  onCityChange(event: Event): void {
    this.selectedCity = (event.target as HTMLSelectElement).value || null;
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
      selectedArea: this.selectedArea,
      selectedCity: this.selectedCity,
    };
    this.filterChange.emit(filterData);
  }
}
