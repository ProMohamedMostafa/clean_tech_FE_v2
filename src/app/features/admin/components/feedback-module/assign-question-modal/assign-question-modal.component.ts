import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil, finalize } from 'rxjs';
import { SectionService } from '../../../services/work-location/section.service';

@Component({
  selector: 'app-assign-question-modal',
  templateUrl: './assign-question-modal.component.html',
  styleUrls: ['./assign-question-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
})
export class AssignQuestionModalComponent implements OnInit, OnDestroy {
  @Input() questions: any[] = [];
  @Input() organizationId?: number;
  @Input() buildingId?: number;
  @Input() floorId?: number;

  @Output() assigned = new EventEmitter<{
    sectionId: number;
    questionIds: number[];
  }>();
  @Output() closed = new EventEmitter<void>();

  sections: any[] = [];
  selectedSectionId: number | null = null;
  isLoadingSections = false;
  sectionsError = '';

  private destroy$ = new Subject<void>();

  constructor(private sectionService: SectionService) {}

  ngOnInit(): void {
    this.loadSections();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadSections(): void {
    this.isLoadingSections = true;
    this.sectionsError = '';

    const filters: any = {
      PageNumber: 1,
      PageSize: 1000,
    };

    if (this.organizationId) filters.organizationId = this.organizationId;
    if (this.buildingId) filters.buildingId = this.buildingId;
    if (this.floorId) filters.floorId = this.floorId;

    this.sectionService
      .getSectionsPaged(filters)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoadingSections = false))
      )
      .subscribe({
        next: (response) =>
          (this.sections = response?.data ? response.data : []),
        error: (err) => {
          console.error('Error loading sections:', err);
          this.sectionsError = 'Failed to load sections. Please try again.';
          this.sections = [];
        },
      });
  }

  getSectionName(sectionId: number): string {
    const section = this.sections.find((s) => s.id === sectionId);
    return section ? section.name : `Section ${sectionId}`;
  }

  // ✅ Assign all questions automatically (no manual selection needed)
  assign(): void {
    if (!this.selectedSectionId || this.questions.length === 0) return;

    const selectedQuestionIds = this.questions.map((q) => q.id);

    this.assigned.emit({
      sectionId: this.selectedSectionId,
      questionIds: selectedQuestionIds,
    });
  }

  close(): void {
    this.closed.emit();
  }

  canAssign(): boolean {
    return this.selectedSectionId !== null && this.questions.length > 0;
  }

  retryLoadSections(): void {
    this.loadSections();
  }
}
