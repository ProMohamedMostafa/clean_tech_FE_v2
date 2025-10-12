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
import {
  Question,
  QuestionListResponse,
} from '../../../../../models/feedback/question.model';
import { QuestionsService } from '../../../../../services/feedback/questions.service';

@Component({
  selector: 'app-section-questions',
  templateUrl: './section-questions.component.html',
  styleUrls: ['./section-questions.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FeedbackFilterBarComponent,
    QuestionContainerComponent,
    QuestionFilterComponent,
  ],
})
export class SectionQuestionsComponent implements OnInit, OnChanges {
  // ================================
  // INPUT PROPERTIES
  // ================================
  @Input() sectionData: any | null = null;
  currentContentType: 'Section Questions' | 'feedback' | 'audits' =
    'Section Questions';
  filterData: any = {
    sectionId: undefined,
    feedbackId: undefined,
    auditId: undefined,
    pointId: undefined,
    SectionUsageId: undefined,
  };

  // Type mappings for API (update these numbers based on your actual API expectations)
  private readonly typeMappings = {
    'Section Questions': 1,
    feedback: 2,
    audits: 3,
  } as const;

  // ================================
  // COMPONENT STATE PROPERTIES
  // ================================

  // Loading & UI States
  showFilterModal = false;
  isLoading = false;

  // Data Collections
  questions: Question[] = [];
  selectedQuestionIds: number[] = [];

  // Pagination Settings
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  pageSize = 4;

  // Search & Filtering
  searchQuery = '';

  // User & Permissions
  currentUserRole = 'Admin';

  // Organization/Building/Floor filters for sections
  organizationId?: number;
  buildingId?: number;
  floorId?: number;

  // ================================
  // CONSTRUCTOR & LIFECYCLE
  // ================================

  constructor(
    private router: Router,
    private questionsService: QuestionsService  
  ) {}

  ngOnInit(): void {
    this.initializeFromSectionData();
    this.loadQuestions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sectionData'] && this.sectionData) {
      this.initializeFromSectionData();
    }
  }

  // ================================
  // INITIALIZATION METHODS
  // ================================

  /**
   * Initialize component with section data
   */
  private initializeFromSectionData(): void {
    if (this.sectionData) {
      // Set section ID in filter data
      this.filterData.sectionId = this.sectionData.id;

      // Set organization, building, floor IDs if needed
      this.organizationId = this.sectionData.organizationId;
      this.buildingId = this.sectionData.buildingId;
      this.floorId = this.sectionData.floorId;
    }
  }

  // ================================
  // CONTENT TYPE MANAGEMENT
  // ================================

  // ================================
  // DATA LOADING & REFRESH METHODS
  // ================================

  /**
   * Load questions with current filters and pagination
   */
  loadQuestions(): void {
    if (!this.sectionData) {
      console.warn('No section data available');
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

  // ================================
  // SEARCH & PAGINATION HANDLERS
  // ================================

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

  // ================================
  // QUESTION SELECTION MANAGEMENT
  // ================================

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

  // ================================
  // DELETE QUESTION OPERATIONS
  // ================================

  /**
   * Handle bulk delete from filter bar
   */
  onBulkDelete(): void {
    if (this.selectedQuestionIds.length === 0) {
      this.showAlert(
        'warning',
        'Please select at least one question to delete.'
      );
      return;
    }

    const count = this.selectedQuestionIds.length;
    const message =
      count === 1
        ? "You won't be able to revert this!"
        : `You won't be able to revert deleting these ${count} questions!`;

    Swal.fire({
      title: 'Are you sure?',
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete them!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.executeBulkDelete();
      }
    });
  }

  /**
   * Execute bulk delete operation
   */
  private executeBulkDelete(): void {
    this.isLoading = true;

    this.questionsService
      .deleteQuestions(this.selectedQuestionIds)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (success) => this.handleBulkDeleteSuccess(success),
        error: (error) => this.handleBulkDeleteError(error),
      });
  }

  /**
   * Handle successful bulk delete
   */
  private handleBulkDeleteSuccess(success: boolean): void {
    if (success) {
      const count = this.selectedQuestionIds.length;
      this.showAlert('success', `${count} question(s) deleted successfully!`);
      this.selectedQuestionIds = [];
      this.loadQuestions();
    } else {
      this.showAlert('error', 'Failed to delete questions.');
    }
  }

  /**
   * Handle bulk delete error
   */
  private handleBulkDeleteError(error: any): void {
    console.error('Error deleting questions:', error);
    this.showAlert('error', 'An error occurred while deleting questions.');
  }

  /**
   * Delete single question with confirmation
   */
  onDeleteQuestion(questionOrId: number | Question): void {
    const questionId =
      typeof questionOrId === 'number' ? questionOrId : questionOrId.id;

    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.executeSingleDelete(questionId);
      }
    });
  }

  /**
   * Execute single question delete
   */
  private executeSingleDelete(questionId: number): void {
    this.isLoading = true;

    this.questionsService
      .deleteQuestions([questionId])
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (success) => this.handleSingleDeleteSuccess(success, questionId),
        error: (error) => this.handleSingleDeleteError(error),
      });
  }

  /**
   * Handle successful single delete
   */
  private handleSingleDeleteSuccess(
    success: boolean,
    questionId: number
  ): void {
    if (success) {
      this.showAlert('success', 'Question has been deleted.');
      this.selectedQuestionIds = this.selectedQuestionIds.filter(
        (id) => id !== questionId
      );
      this.loadQuestions();
    } else {
      this.showAlert('error', 'Failed to delete question.');
    }
  }

  /**
   * Handle single delete error
   */
  private handleSingleDeleteError(error: any): void {
    console.error('Error deleting question:', error);
    this.showAlert('error', 'An error occurred while deleting the question.');
  }

  // ================================
  // FILTER OPERATIONS
  // ================================

  /**
   * Build filters for API request
   */
  private buildFilters(): any {
    return {
      PageNumber: this.currentPage,
      PageSize: this.pageSize,
      Search: this.searchQuery,
      SectionId: this.filterData?.sectionId || this.sectionData?.id,
      PointId: this.filterData?.pointId,
      SectionUsageId: this.filterData?.SectionUsageId,
    };
  }

  /**
   * Reset all filters
   */
  resetFilters(): void {
    this.filterData = {
      type: this.currentContentType,
      sectionId: this.sectionData?.id,
      pointId: undefined,
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
      sectionId: this.sectionData?.id, // Always keep section ID
    };
    this.currentPage = 1;
    this.loadQuestions();
    this.closeFilterModal();
  }

  // ================================
  // UTILITY & HELPER METHODS
  // ================================

  /**
   * Check if current user is admin
   */
  isAdmin(): boolean {
    return this.currentUserRole === 'Admin';
  }

  /**
   * Get section info for display
   */
  getSectionDisplayInfo(): string {
    if (!this.sectionData) return 'Unknown Section';

    return `${this.sectionData.name} - ${this.sectionData.floorName}, ${this.sectionData.buildingName}`;
  }

  /**
   * Get current content type display name
   */
  getContentTypeDisplayName(): string {
    return this.currentContentType === 'feedback'
      ? 'Feedback Questions'
      : 'Audit Questions';
  }

  /**
   * Check if section has feedback questions
   */
  hasFeedbackQuestions(): boolean {
    return this.sectionData?.feedbackId != null;
  }

  /**
   * Check if section has audit questions
   */
  hasAuditQuestions(): boolean {
    return this.sectionData?.auditId != null;
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
