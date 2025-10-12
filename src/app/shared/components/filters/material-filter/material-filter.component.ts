import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PageTitleComponent } from '../../page-title/page-title.component';

@Component({
  selector: 'app-material-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PageTitleComponent],
  templateUrl: './material-filter.component.html',
  styleUrls: ['./material-filter.component.scss'],
})
export class MaterialFilterComponent implements OnInit {
  // Input properties from parent component
  @Input() selectedCategory: string | null = null;
  @Input() categories: any[] = [];
  @Input() minQuantity: number | null = null;
  @Input() maxQuantity: number | null = null;

  // Output events for parent component
  @Output() filterChange = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();

  isLoadingCategories = false;

  constructor() {}

  ngOnInit(): void {}

  /**
   * Handle category selection change
   */
  onCategoryChange(event: Event): void {
    this.selectedCategory = (event.target as HTMLSelectElement).value || null;
  }

  /**
   * Handle min quantity change
   */
  onMinQuantityChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.minQuantity = value ? parseInt(value) : null;
  }

  /**
   * Handle max quantity change
   */
  onMaxQuantityChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.maxQuantity = value ? parseInt(value) : null;
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
    this.selectedCategory = null;
    this.minQuantity = null;
    this.maxQuantity = null;
    this.reset.emit();
  }

  /**
   * Apply the selected filters
   */
  applyFilter(): void {
    const filterData = {
      category: this.selectedCategory,
      minQuantity: this.minQuantity,
      maxQuantity: this.maxQuantity,
    };
    this.filterChange.emit(filterData);
  }
}
