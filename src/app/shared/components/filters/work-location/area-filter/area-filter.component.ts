import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CountryService } from '../../../../../features/admin/services/work-location/country.service';
import { PageTitleComponent } from "../../../page-title/page-title.component";

@Component({
  selector: 'app-area-filter',
  imports: [CommonModule, TranslateModule, PageTitleComponent],
  templateUrl: './area-filter.component.html',
  styleUrl: './area-filter.component.scss',
})
export class AreaFilterComponent implements OnInit {
  // Input properties from parent component
  @Input() selectedCountry: string | null = null;

  // Output events for parent component
  @Output() filterChange = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  // Component state variables
  countries: string[] = [];
  showFilterModal: boolean = true; // Always show when component is rendered

  constructor(private countryService: CountryService) {}

  /* ------------------------- */
  /* ----- Lifecycle Hooks ---- */
  /* ------------------------- */

  ngOnInit(): void {
    this.loadCountries();
  }

  /* ------------------------- */
  /* ----- Data Fetching ----- */
  /* ------------------------- */

  /**
   * Loads list of countries from API
   */
  loadCountries(): void {
    this.countryService.getNationalities().subscribe(
      (response) => {
        this.countries = response.data.map((country: any) => country.name);
      },
      (error) => {
        console.error('Error fetching nationalities:', error);
      }
    );
  }

  /* ------------------------- */
  /* ---- Filter Modal ------- */
  /* ------------------------- */

  /**
   * Opens the filter modal
   */
  openFilterModal(): void {
    // Not needed since modal is controlled by parent
  }

  /**
   * Closes the filter modal
   */
  closeFilterModal(): void {
    this.close.emit();
  }

  /**
   * Applies the selected filter and closes the modal
   */
  applyFilter(): void {
    const filterData = {
      selectedCountry: this.selectedCountry || null,
    };
    this.filterChange.emit(filterData);
  }

  /**
   * Handles country selection change
   * @param {Event} event - Select change event
   */
  onCountryChange(event: Event): void {
    this.selectedCountry = (event.target as HTMLSelectElement).value;
  }
}
