import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';

import { FeedbackFilterBarComponent } from '../../../../../components/feedback-module/feedback-filter-bar/feedback-filter-bar.component';
import { QuestionContainerComponent } from '../../../../../components/feedback-module/question-container/question-container.component';
import { QuestionFilterComponent } from '../../../../../components/feedback-module/question-filter/question-filter.component';
import { PointAssignModalComponent } from './components/point-assign-modal/point-assign-modal.component';

import {
  Question,
  QuestionListResponse,
} from '../../../../../models/feedback/question.model';
import { QuestionsService } from '../../../../../services/feedback/questions.service';

@Component({
  selector: 'app-point-questions',
  templateUrl: './point-questions.component.html',
  styleUrls: ['./point-questions.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FeedbackFilterBarComponent,
    QuestionContainerComponent,
    QuestionFilterComponent,
    PointAssignModalComponent,
  ],
})
export class PointQuestionsComponent implements OnInit, OnChanges {
  // ========================================
  // INPUT PROPERTIES
  // ========================================

  @Input() pointData: any | null = null;

  // ========================================
  // PUBLIC PROPERTIES
  // ========================================

  // Filter Configuration
  filterData: any = {
    sectionId: undefined,
    feedbackId: undefined,
    auditId: undefined,
    pointId: undefined,
    SectionUsageId: undefined,
  };

  // UI State Management
  showFilterModal = false;
  showAddQuestionModal = false;
  isLoading = false;

  // Data Collections
  questions: Question[] = [];
  selectedQuestionIds: number[] = [];

  // Pagination Configuration
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  pageSize = 4;

  // Search Configuration
  searchQuery = '';

  // User & Permission Settings
  currentUserRole = 'Admin';

  // Hierarchical Data Properties
  organizationId?: number;
  buildingId?: number;
  floorId?: number;
  sectionId!: number;
  pointId!: number;

  // ========================================
  // CONSTRUCTOR & LIFECYCLE HOOKS
  // ========================================

  constructor(
    private router: Router,
    private questionsService: QuestionsService
  ) {}

  ngOnInit(): void {
    this.initializeFromPointData();
    this.loadQuestions();
    console.log(this.pointData);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pointData'] && this.pointData) {
      this.initializeFromPointData();
    }
  }

  // ========================================
  // INITIALIZATION METHODS
  // ========================================

  /**
   * Initialize component with point data
   */
  private initializeFromPointData(): void {
    if (this.pointData) {
      // Set point ID in filter data
      this.filterData.pointId = this.pointData.id;

      // Set organization, building, floor, section IDs if needed
      this.organizationId = this.pointData.organizationId;
      this.buildingId = this.pointData.buildingId;
      this.floorId = this.pointData.floorId;
      this.sectionId = this.pointData.sectionId;
      this.pointId = this.pointData.id;
    }
  }

  // ========================================
  // DATA LOADING & MANAGEMENT
  // ========================================

  /**
   * Load questions with current filters and pagination
   */
  loadQuestions(): void {
    if (!this.pointData) {
      console.warn('No point data available');
      return;
    }

    this.isLoading = true;
    const params = this.buildFilters();

    this.questionsService
      .getQuestions(params)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response: QuestionListResponse | null) =>
          this.handleQuestionsResponse(response),
        error: (error) => this.handleLoadError(error),
      });
  }

  /**
   * Handle successful questions loading response
   */
  private handleQuestionsResponse(response: QuestionListResponse | null): void {
    if (response?.data?.data) {
      this.questions = response.data.data;
      this.totalCount = response.data.totalCount;
      this.totalPages = Math.ceil(this.totalCount / this.pageSize);
    } else {
      this.resetQuestionsData();
    }
  }

  /**
   * Reset questions data to empty state
   */
  private resetQuestionsData(): void {
    this.questions = [];
    this.totalCount = 0;
    this.totalPages = 1;
  }

  /**
   * Handle questions loading error
   */
  private handleLoadError(error: any): void {
    console.error('Error loading questions:', error);
    this.showAlert(
      'error',
      'Failed to load questions. Please try again later.'
    );
  }

  // ========================================
  // SEARCH & PAGINATION HANDLERS
  // ========================================

  /**
   * Handle search input changes
   */
  onSearchChange(searchTerm: string): void {
    this.searchQuery = searchTerm;
    this.currentPage = 1;
    this.loadQuestions();
  }

  /**
   * Handle pagination changes
   */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadQuestions();
  }

  /**
   * Handle page size changes
   */
  onPageSizeChange(newPageSize: number): void {
    this.pageSize = newPageSize;
    this.currentPage = 1;
    this.loadQuestions();
  }

  // ========================================
  // QUESTION SELECTION MANAGEMENT
  // ========================================

  /**
   * Handle select all checkbox toggle
   */
  onSelectAllChanged(isSelected: boolean): void {
    this.selectedQuestionIds = isSelected
      ? this.questions.map((q) => q.id)
      : [];
  }

  /**
   * Handle individual question selection
   */
  onQuestionSelectionChanged(questionId: number, isSelected: boolean): void {
    if (isSelected) {
      this.selectedQuestionIds.push(questionId);
    } else {
      this.selectedQuestionIds = this.selectedQuestionIds.filter(
        (id) => id !== questionId
      );
    }
  }

  /**
   * Get currently selected questions
   */
  getSelectedQuestions(): Question[] {
    return this.questions.filter((q) =>
      this.selectedQuestionIds.includes(q.id)
    );
  }

  // ========================================
  // QUESTION ASSIGNMENT OPERATIONS
  // ========================================

  /**
   * Open question assignment modal
   */
  onAssignQuestion(): void {
    this.showAddQuestionModal = true;
  }

  /**
   * Close add question modal
   */
  closeAddQuestionModal(): void {
    this.showAddQuestionModal = false;
  }

  // ========================================
  // QUESTION REMOVAL OPERATIONS
  // ========================================

  /**
   * Handle bulk remove from filter bar
   */
  onBulkRemove(): void {
    if (this.selectedQuestionIds.length === 0) {
      this.showAlert(
        'warning',
        'Please select at least one question to remove from this point.'
      );
      return;
    }

    const count = this.selectedQuestionIds.length;
    const message =
      count === 1
        ? 'You are about to remove this question from the point.'
        : `You are about to remove these ${count} questions from the point.`;

    Swal.fire({
      title: 'Are you sure?',
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, remove them!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.executeBulkRemove();
      }
    });
  }

  /**
   * Execute bulk remove operation
   */
  private executeBulkRemove(): void {
    this.isLoading = true;

    this.questionsService
      .removeQuestionsFromPoint(this.pointId, this.selectedQuestionIds)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (success) => this.handleBulkRemoveSuccess(success),
        error: (error) => this.handleBulkRemoveError(error),
      });
  }

  /**
   * Handle successful bulk remove
   */
  private handleBulkRemoveSuccess(success: boolean): void {
    if (success) {
      const count = this.selectedQuestionIds.length;
      this.showAlert(
        'success',
        `${count} question(s) removed from this point successfully!`
      );
      this.selectedQuestionIds = [];
      this.loadQuestions();
    } else {
      this.showAlert('error', 'Failed to remove questions from this point.');
    }
  }

  /**
   * Handle bulk remove error
   */
  private handleBulkRemoveError(error: any): void {
    console.error('Error removing questions from point:', error);
    this.showAlert(
      'error',
      'An error occurred while removing questions from this point.'
    );
  }

  /**
   * Remove single question with confirmation
   */
  onRemoveQuestion(questionOrId: number | Question): void {
    const questionId =
      typeof questionOrId === 'number' ? questionOrId : questionOrId.id;

    Swal.fire({
      title: 'Are you sure?',
      text: 'This will remove the question from the point but not delete it from the system.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, remove it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.executeSingleRemove(questionId);
      }
    });
  }

  /**
   * Execute single question remove
   */
  private executeSingleRemove(questionId: number): void {
    this.isLoading = true;

    this.questionsService
      .removeQuestionsFromPoint(this.pointId, [questionId])
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (success) => this.handleSingleRemoveSuccess(success, questionId),
        error: (error) => this.handleSingleRemoveError(error),
      });
  }

  /**
   * Handle successful single remove
   */
  private handleSingleRemoveSuccess(
    success: boolean,
    questionId: number
  ): void {
    if (success) {
      this.showAlert('success', 'Question removed from this point.');
      this.selectedQuestionIds = this.selectedQuestionIds.filter(
        (id) => id !== questionId
      );
      this.loadQuestions();
    } else {
      this.showAlert('error', 'Failed to remove question from this point.');
    }
  }

  /**
   * Handle single remove error
   */
  private handleSingleRemoveError(error: any): void {
    console.error('Error removing question from point:', error);
    this.showAlert(
      'error',
      'An error occurred while removing the question from this point.'
    );
  }

  // ========================================
  // FILTER MANAGEMENT
  // ========================================

  /**
   * Build filters for API request
   */
  private buildFilters(): any {
    return {
      PageNumber: this.currentPage,
      PageSize: this.pageSize,
      Search: this.searchQuery,
      PointId: this.filterData?.pointId || this.pointData?.id,
      SectionId: this.filterData?.sectionId,
      SectionUsageId: this.filterData?.SectionUsageId,
    };
  }

  /**
   * Reset all filters
   */
  resetFilters(): void {
    this.filterData = {
      pointId: this.pointData?.id,
      sectionId: undefined,
      SectionUsageId: undefined,
    };
    this.currentPage = 1;
    this.loadQuestions();
  }

  /**
   * Open filter modal
   */
  openFilterModal(): void {
    this.showFilterModal = true;
  }

  /**
   * Close filter modal
   */
  closeFilterModal(): void {
    this.showFilterModal = false;
  }

  /**
   * Handle filter application
   */
  onFilterApplied(filterData: any): void {
    this.filterData = {
      ...filterData,
      pointId: this.pointData?.id, // Always keep point ID
    };
    this.currentPage = 1;
    this.loadQuestions();
    this.closeFilterModal();
  }

  // ========================================
  // UTILITY & HELPER METHODS
  // ========================================

  /**
   * Check if current user is admin
   */
  isAdmin(): boolean {
    return this.currentUserRole === 'Admin';
  }

  /**
   * Get point info for display
   */
  getPointDisplayInfo(): string {
    if (!this.pointData) return 'Unknown Point';

    return `${this.pointData.name} - ${this.pointData.sectionName}, ${this.pointData.floorName}, ${this.pointData.buildingName}`;
  }

  /**
   * Check if point has feedback questions
   */
  hasFeedbackQuestions(): boolean {
    return this.pointData?.feedbackId != null;
  }

  /**
   * Check if point has audit questions
   */
  hasAuditQuestions(): boolean {
    return this.pointData?.auditId != null;
  }

  /**
   * Unified alert method for all notifications
   */
  private showAlert(
    type: 'success' | 'error' | 'warning' | 'info',
    message: string
  ): void {
    const config = {
      success: { title: 'Success!', icon: 'success' as const },
      error: { title: 'Error!', icon: 'error' as const },
      warning: { title: 'Warning!', icon: 'warning' as const },
      info: { title: 'Info', icon: 'info' as const },
    };

    Swal.fire({
      title: config[type].title,
      text: message,
      icon: config[type].icon,
      confirmButtonText: 'OK',
    });
  }
}
