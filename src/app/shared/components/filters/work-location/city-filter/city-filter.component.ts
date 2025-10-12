import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FilterBarService } from '../../../../services/filter-bar.service';
import { PageTitleComponent } from "../../../page-title/page-title.component";

@Component({
  selector: 'app-city-filter',
  imports: [CommonModule, FormsModule, TranslateModule, PageTitleComponent],
  templateUrl: './city-filter.component.html',
  styleUrl: '../area-filter/area-filter.component.scss',
})
export class CityFilterComponent implements OnInit {
  // Input properties from parent component
  @Input() selectedCountry: string | null = null;
  @Input() selectedArea: string | null = null;

  // Output events for parent component
  @Output() filterChange = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  // Component state variables
  countries: { name: string }[] = [];
  areas: any[] = [];

  constructor(private filterBarService: FilterBarService) {}

  /* ------------------------- */
  /* ----- Lifecycle Hooks ---- */
  /* ------------------------- */

  ngOnInit(): void {
    this.loadCountries();

    // Load areas if country is already selected
    if (this.selectedCountry) {
      this.loadAreasByCountry(this.selectedCountry);
    }
  }

  /* ------------------------- */
  /* ----- Data Fetching ----- */
  /* ------------------------- */

  /**
   * Loads list of countries from API
   */
  loadCountries(): void {
    this.filterBarService.loadNationalities().subscribe({
      next: (countries) => {
        this.countries = countries.map((country: any) => ({
          name: country.name,
        }));
      },
      error: (error) => {
        console.error('Error fetching nationalities:', error);
        this.countries = [];
      },
    });
  }

  /**
   * Loads areas by country
   * @param {string} countryName - Country name to filter areas
   */
  loadAreasByCountry(countryName: string): void {
    this.filterBarService.loadAreasByCountry(countryName).subscribe({
      next: (areas) => {
        this.areas = areas;
      },
      error: (error) => {
        console.error('Error fetching areas:', error);
        this.areas = [];
      },
    });
  }

  /* ------------------------- */
  /* ---- Filter Modal ------- */
  /* ------------------------- */

  /**
   * Handles country selection change
   * @param {Event} event - Select change event
   */
  onCountryChange(event: Event): void {
    this.selectedCountry = (event.target as HTMLSelectElement).value || null;

    // Reset area selection when country changes
    this.selectedArea = null;

    // Load areas for the selected country
    if (this.selectedCountry) {
      this.loadAreasByCountry(this.selectedCountry);
    } else {
      this.areas = [];
    }
  }

  /**
   * Handles area selection change
   * @param {Event} event - Select change event
   */
  onAreaChange(event: Event): void {
    this.selectedArea = (event.target as HTMLSelectElement).value || null;
  }

  /**
   * Closes the filter modal
   */
  closeFilterModal(): void {
    this.close.emit();
  }

  /**
   * Applies the selected filters and closes the modal
   */
  applyFilter(): void {
    const filterData = {
      selectedCountry: this.selectedCountry,
      selectedArea: this.selectedArea,
    };
    this.filterChange.emit(filterData);
  }
}
