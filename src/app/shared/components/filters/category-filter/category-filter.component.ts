import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PageTitleComponent } from '../../page-title/page-title.component';
import { FilterBarService } from '../../../services/filter-bar.service';

@Component({
  selector: 'app-category-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PageTitleComponent],
  templateUrl: './category-filter.component.html',
  styleUrls: ['./category-filter.component.scss'],
})
export class CategoryFilterComponent implements OnInit {
  // Input properties from parent component
  @Input() selectedUnit: string | null = null;
  @Input() selectedParentCategory: string | null = null;

  // Output events for parent component
  @Output() filterChange = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();

  // Component state variables
  unitOptions = [
    { id: 0, name: 'Ml' },
    { id: 1, name: 'L' },
    { id: 2, name: 'Kg' },
    { id: 3, name: 'G' },
    { id: 4, name: 'M' },
    { id: 5, name: 'Cm' },
    { id: 6, name: 'Pieces' },
  ];
  parentCategories: any[] = [];
  isLoadingParentCategories = false;

  constructor(private filterBarService: FilterBarService) {}

  ngOnInit(): void {}

  /**
   * Handle unit selection change
   */
  onUnitChange(event: Event): void {
    this.selectedUnit = (event.target as HTMLSelectElement).value || null;
  }

  /**
   * Handle parent category selection change
   */
  onParentCategoryChange(event: Event): void {
    this.selectedParentCategory =
      (event.target as HTMLSelectElement).value || null;
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
    this.selectedUnit = null;
    this.selectedParentCategory = null;
    this.reset.emit();
  }

  /**
   * Apply the selected filters
   */
  applyFilter(): void {
    const filterData = {
      selectedUnit: this.selectedUnit,
      selectedParentCategory: this.selectedParentCategory,
    };
    this.filterChange.emit(filterData);
  }
}
