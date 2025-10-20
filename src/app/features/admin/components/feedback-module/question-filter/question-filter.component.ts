// question-filter.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { FilterBarService } from '../../../../../shared/services/filter-bar.service';
import { QuestionType } from '../../../models/feedback/question.model';

@Component({
  selector: 'app-question-filter',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  templateUrl: './question-filter.component.html',
  styleUrls: ['./question-filter.component.scss'],
})
export class QuestionFilterComponent {
  @Output() filterChange = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  filterData: any = {
    searchQuery: '',
    type: undefined,
    sectionId: undefined,
    pointId: undefined,
  };

  // Dropdown options - Updated for new enum values
  questionTypes = [
    { value: QuestionType.Radio, label: 'QUESTION_MANAGEMENT.TYPES.RADIO' },
    {
      value: QuestionType.Checkbox,
      label: 'QUESTION_MANAGEMENT.TYPES.CHECKBOX',
    },
    { value: QuestionType.Text, label: 'QUESTION_MANAGEMENT.TYPES.TEXT' },
    {
      value: QuestionType.RatingStar,
      label: 'QUESTION_MANAGEMENT.TYPES.RATING_STAR',
    },
    {
      value: QuestionType.RatingEmoji,
      label: 'QUESTION_MANAGEMENT.TYPES.RATING_EMOJI',
    },
    { value: QuestionType.Bool, label: 'QUESTION_MANAGEMENT.TYPES.BOOL' },
  ];

  sections: any[] = [];
  points: any[] = [];
  isLoadingSections = false;
  isLoadingPoints = false;

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

  onSectionChange(sectionId: number): void {
    if (sectionId) {
      this.isLoadingPoints = true;
      this.filterBarService.loadPointsBySection(sectionId).subscribe({
        next: (points) => {
          this.points = points;
          this.isLoadingPoints = false;
        },
        error: () => {
          this.isLoadingPoints = false;
        },
      });
    } else {
      this.points = [];
      this.filterData.pointId = undefined;
    }
  }

  applyFilters(): void {
    console.log('Original filterData:', this.filterData); // Log original data

    const filters = {
      ...this.filterData,
      // Explicitly check for null/undefined (but allow 0)
      type: this.filterData.type === null ? undefined : this.filterData.type,
      sectionId:
        this.filterData.sectionId === null
          ? undefined
          : this.filterData.sectionId,
      pointId:
        this.filterData.pointId === null ? undefined : this.filterData.pointId,
    };

    console.log('Processed filters before emit:', filters); // Log processed filters
    this.filterChange.emit(filters);
  }

  resetFilters(): void {
    this.filterData = {
      searchQuery: '',
      type: undefined,
      sectionId: undefined,
      pointId: undefined,
    };
    this.points = [];
  }

  closeModal(): void {
    this.close.emit();
  }
}
