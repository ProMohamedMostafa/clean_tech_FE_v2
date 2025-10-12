// feedback-filter.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { FilterBarService } from '../../../../../shared/services/filter-bar.service';

@Component({
  selector: 'app-feedback-filter',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  templateUrl: './feedback-filter.component.html',
  styleUrls: ['./feedback-filter.component.scss'],
})
export class FeedbackFilterComponent {
  @Output() filterChange = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  filterData: any = {
    searchQuery: '',
    sectionId: undefined,
  };

  sections: any[] = [];
  isLoadingSections = false;

  constructor(private filterBarService: FilterBarService) {}

  ngOnInit(): void {
    this.loadSections();
  }

  loadSections(): void {
    this.isLoadingSections = true;
    this.filterBarService.loadSectionsPaged(1, 100).subscribe({
      next: (sections) => {
        this.sections = sections;
        this.isLoadingSections = false;
      },
      error: () => {
        this.isLoadingSections = false;
      },
    });
  }

  applyFilters(): void {
    const filters = {
      ...this.filterData,
      sectionId:
        this.filterData.sectionId === null
          ? undefined
          : this.filterData.sectionId,
    };
    this.filterChange.emit(filters);
  }

  resetFilters(): void {
    this.filterData = {
      searchQuery: '',
      sectionId: undefined,
    };
  }

  closeModal(): void {
    this.close.emit();
  }
}
