import { Component } from '@angular/core';
import { CategoryFilterComponent } from '../../../../shared/components/filters/category-filter/category-filter.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test',
  imports: [CategoryFilterComponent, CommonModule],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss',
})
export class TestComponent {
  showFilterModal = false;

  openFilterModal() {
    this.showFilterModal = true;
  }

  closeFilterModal() {
    this.showFilterModal = false;
  }
  onApplyFilter(filterData: any) {
    console.log('Applied filters:', filterData);
    // Apply your filters here
    this.closeFilterModal();
  }

  onResetFilters() {
    console.log('Filters reset');
    // Reset your filters here
  }
}
