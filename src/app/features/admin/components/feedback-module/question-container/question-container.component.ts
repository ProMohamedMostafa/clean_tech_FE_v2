// feedback-container.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionCardComponent } from '../question-card/question-card.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-question-container',
  standalone: true,
  imports: [CommonModule, QuestionCardComponent,TranslateModule],
  templateUrl: './question-container.component.html',
  styleUrls: ['./question-container.component.scss'],
})
export class QuestionContainerComponent implements OnInit, OnChanges {
  @Input() showButtons: boolean = true;
  @Input() showCheck: boolean = true;
  // ================================
  // INPUT PROPERTIES
  // ================================

  @Input() feedbacks: any[] = [];
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() totalCount: number = 0;
  @Input() pageSize: number = 8;

  // ================================
  // OUTPUT EVENTS
  // ================================

  @Output() pageChanged = new EventEmitter<number>();
  @Output() pageSizeChanged = new EventEmitter<number>(); // NEW: Page size change event
  @Output() viewFeedback = new EventEmitter<any>();
  @Output() editFeedback = new EventEmitter<any>();
  @Output() deleteFeedback = new EventEmitter<any>();
  @Output() selectAllChanged = new EventEmitter<boolean>();
  @Output() questionSelectionChanged = new EventEmitter<{
    questionId: number;
    isSelected: boolean;
  }>();
  @Output() collapseAll = new EventEmitter<void>();
  @Output() expandAll = new EventEmitter<void>();
  @Output() unassignPreChecked = new EventEmitter<number>(); // NEW: Emit question ID

  // ================================
  // COMPONENT STATE
  // ================================

  // FIXED: Use consistent number type for IDs
  selectedQuestionIds: number[] = [];
  collapsedQuestionIds: number[] = [];

  // Select all state tracking
  isSelectAllChecked: boolean = false;
  isSelectAllIndeterminate: boolean = false;

  constructor(private cdr: ChangeDetectorRef) {}

  // ================================
  // LIFECYCLE HOOKS
  // ================================

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['feedbacks']) {
      this.resetComponentState();
    }
  }

  private initializeComponent(): void {
    // FIXED: Initialize with all questions collapsed
    this.collapsedQuestionIds = this.feedbacks.map((f) => f.id);
    this.updateSelectAllState();
  }

  private resetComponentState(): void {
    // Reset all states when feedbacks change
    this.selectedQuestionIds = [];
    this.collapsedQuestionIds = this.feedbacks.map((f) => f.id);
    this.updateSelectAllState();
  }

  // ================================
  // SELECTION MANAGEMENT
  // ================================

  /**
   * Check if a question is selected
   */
  isSelected(id: number): boolean {
    return this.selectedQuestionIds.includes(id);
  }

  /**
   * Handle select all checkbox change - FIXED
   */
  onSelectAllChange(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      // FIXED: Select all current feedbacks using number IDs
      this.selectedQuestionIds = this.feedbacks.map((f) => f.id);
    } else {
      // Clear all selections
      this.selectedQuestionIds = [];
    }

    this.updateSelectAllState();
    this.selectAllChanged.emit(isChecked);
  }

  /**
   * Handle individual question selection - FIXED
   */
  onQuestionSelect(id: number, isSelected: boolean): void {
    if (isSelected) {
      // Add to selection if not already selected
      if (!this.selectedQuestionIds.includes(id)) {
        this.selectedQuestionIds.push(id);
      }
    } else {
      // Remove from selection
      this.selectedQuestionIds = this.selectedQuestionIds.filter(
        (selectedId) => selectedId !== id
      );
    }

    this.updateSelectAllState();
    this.questionSelectionChanged.emit({
      questionId: id,
      isSelected: isSelected,
    });
  }

  /**
   * Update select all checkbox state - FIXED
   */
  private updateSelectAllState(): void {
    if (this.feedbacks.length === 0) {
      this.isSelectAllChecked = false;
      this.isSelectAllIndeterminate = false;
      return;
    }

    // FIXED: Check if all feedbacks are selected using number comparison
    const allSelected = this.feedbacks.every((f) =>
      this.selectedQuestionIds.includes(f.id)
    );
    const someSelected = this.selectedQuestionIds.length > 0;

    this.isSelectAllChecked = allSelected;
    this.isSelectAllIndeterminate = someSelected && !allSelected;

    this.cdr.detectChanges();
  }

  // ================================
  // COLLAPSE/EXPAND MANAGEMENT
  // ================================

  /**
   * Check if a question is collapsed
   */
  isCollapsed(id: number): boolean {
    return this.collapsedQuestionIds.includes(id);
  }

  /**
   * Toggle individual question collapse state - FIXED
   */
  onToggleAnswers(id: number, isCollapsed: boolean): void {
    if (isCollapsed) {
      // Add to collapsed list if not already there
      if (!this.collapsedQuestionIds.includes(id)) {
        this.collapsedQuestionIds.push(id);
      }
    } else {
      // Remove from collapsed list
      this.collapsedQuestionIds = this.collapsedQuestionIds.filter(
        (collapsedId) => collapsedId !== id
      );
    }
  }

  /**
   * Collapse all questions - FIXED
   */
  onCollapseAll(): void {
    this.collapsedQuestionIds = this.feedbacks.map((f) => f.id);
    this.collapseAll.emit();
  }

  /**
   * Expand all questions - FIXED
   */
  onExpandAll(): void {
    this.collapsedQuestionIds = [];
    this.expandAll.emit();
  }

  // ================================
  // FEEDBACK ACTIONS
  // ================================

  onViewFeedback(feedback: any): void {
    this.viewFeedback.emit(feedback);
  }

  onEditFeedback(feedback: any): void {
    this.editFeedback.emit(feedback);
  }

  /**
   * Handle delete feedback - FIXED
   */
  onDeleteFeedback(feedback: any): void {
    const feedbackId = feedback.id;

    // FIXED: Remove from selected items using number ID
    this.selectedQuestionIds = this.selectedQuestionIds.filter(
      (id) => id !== feedbackId
    );

    // FIXED: Remove from collapsed items using number ID
    this.collapsedQuestionIds = this.collapsedQuestionIds.filter(
      (id) => id !== feedbackId
    );

    // Update select all state after deletion
    this.updateSelectAllState();

    // Emit delete event to parent
    this.deleteFeedback.emit(feedback);
  }

  // ================================
  // PAGINATION MANAGEMENT
  // ================================

  // Available page size options - TODO: Make this configurable
  pageSizeOptions: number[] = [4, 8, 12, 16, 20, 24, 50, 100];

  /**
   * Get page numbers for pagination display
   */
  getPageNumbers(): number[] {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(
      1,
      this.currentPage - Math.floor(maxVisiblePages / 2)
    );
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > this.totalPages) {
      endPage = this.totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  /**
   * Handle page change
   */
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageChanged.emit(page);
    }
  }

  /**
   * Handle page size change - NEW
   */
  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newPageSize = parseInt(select.value, 10);

    if (newPageSize && newPageSize !== this.pageSize) {
      this.pageSizeChanged.emit(newPageSize);
    }
  }

  /**
   * Get start and end item numbers for current page
   */
  getItemRange(): { start: number; end: number } {
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.totalCount);
    return { start, end };
  }

  // ================================
  // UTILITY METHODS
  // ================================

  /**
   * Get selected question IDs for external access
   */
  getSelectedQuestionIds(): number[] {
    return [...this.selectedQuestionIds];
  }

  /**
   * Clear all selections programmatically
   */
  clearSelections(): void {
    this.selectedQuestionIds = [];
    this.updateSelectAllState();
  }

  /**
   * Get selected questions count
   */
  getSelectedCount(): number {
    return this.selectedQuestionIds.length;
  }

  /**
   * Track by function for ngFor performance
   */
  trackByFeedbackId(index: number, feedback: any): number {
    return feedback.id;
  }

  isQuestionPreChecked(id: number): boolean {
    const question = this.feedbacks.find((f) => f.id === id);
    return question ? question.isChecked : false;
  }
  onUnassignPreChecked(questionId: number): void {
    this.unassignPreChecked.emit(questionId);
  }
}
