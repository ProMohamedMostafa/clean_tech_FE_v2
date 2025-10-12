import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FilterBarService } from '../../../../services/filter-bar.service';
import { PageTitleComponent } from "../../../page-title/page-title.component";

@Component({
  selector: 'app-building-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PageTitleComponent],
  templateUrl: './building-filter.component.html',
  styleUrl: '../area-filter/area-filter.component.scss',
})
export class BuildingFilterComponent implements OnInit {
  // Input properties from parent component
  @Input() selectedCity: string | null = null;
  @Input() selectedOrganization: string | null = null;

  // Output events for parent component
  @Output() filterChange = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  // Component state variables
  cities: any[] = [];
  organizations: any[] = [];
  isLoadingCities = false;
  isLoadingOrganizations = false;

  constructor(private filterBarService: FilterBarService) {}

  ngOnInit(): void {
    this.loadAllCities();

    // If city is already selected, load its organizations
    if (this.selectedCity) {
      this.loadOrganizationsByCity(+this.selectedCity);
    }
  }

  /**
   * Load all available cities
   */
  loadAllCities(): void {
    this.isLoadingCities = true;
    this.filterBarService.loadCitiesPaged().subscribe({
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
   * Load organizations by selected city
   * @param cityId The ID of the selected city
   */
  loadOrganizationsByCity(cityId: number): void {
    this.isLoadingOrganizations = true;
    this.organizations = []; // Clear previous organizations
    this.selectedOrganization = null; // Reset organization selection

    this.filterBarService.loadOrganizationsByCity(cityId).subscribe({
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
   * Handle city selection change
   */
  onCityChange(event: Event): void {
    const cityId = (event.target as HTMLSelectElement).value;
    this.selectedCity = cityId || null;

    if (this.selectedCity) {
      this.loadOrganizationsByCity(+this.selectedCity);
    } else {
      this.organizations = [];
      this.selectedOrganization = null;
    }
  }

  /**
   * Handle organization selection change
   */
  onOrganizationChange(event: Event): void {
    this.selectedOrganization =
      (event.target as HTMLSelectElement).value || null;
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
      selectedCity: this.selectedCity,
      selectedOrganization: this.selectedOrganization,
    };
    this.filterChange.emit(filterData);
  }
}
