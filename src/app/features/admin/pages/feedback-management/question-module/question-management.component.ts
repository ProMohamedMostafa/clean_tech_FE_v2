import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';

// Services
import { QuestionsService } from '../../../services/feedback/questions.service';

// Components
import { PageTitleComponent } from '../../../../../shared/components/page-title/page-title.component';
import { FeedbackFilterBarComponent } from '../../../components/feedback-module/feedback-filter-bar/feedback-filter-bar.component';
import { QuestionContainerComponent } from '../../../components/feedback-module/question-container/question-container.component';
import { CreateQuestionModalComponent } from '../../../components/feedback-module/create-question-modal/create-question-modal.component';
import { AssignQuestionModalComponent } from '../../../components/feedback-module/assign-question-modal/assign-question-modal.component';

// Models
import {
  Question,
  QuestionListResponse,
} from '../../../models/feedback/question.model';
import { QuestionFilterComponent } from '../../../components/feedback-module/question-filter/question-filter.component';

@Component({
  selector: 'app-question-management',
  templateUrl: './question-management.component.html',
  styleUrls: ['./question-management.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    PageTitleComponent,
    FeedbackFilterBarComponent,
    QuestionContainerComponent,
    CreateQuestionModalComponent,
    AssignQuestionModalComponent,
    QuestionFilterComponent,
  ],
})
export class QuestionManagementComponent implements OnInit {
  // ================================
  // COMPONENT STATE PROPERTIES
  // ================================
  editingQuestion: Question | null = null;

  // Loading & UI States
  showFilterModal = false;
  isLoading = false;
  showCreateModal = false;
  showAssignModal = false;

  // Data Collections
  questions: Question[] = [];
  selectedQuestionIds: number[] = [];
  assignableQuestions: {
    id: number;
    text: string;
    sectionId: number | null;
  }[] = [];

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

  // Add this with other component state properties
  filterData: any = {
    type: undefined,
    sectionId: undefined,
    pointId: undefined,
  };

  // ================================
  // CONSTRUCTOR & LIFECYCLE
  // ================================

  constructor(
    private router: Router,
    private questionsService: QuestionsService
  ) {}

  ngOnInit(): void {
    this.loadQuestions();
  }

  // ================================
  // DATA LOADING & REFRESH METHODS
  // ================================

  /**
   * Load questions with current filters and pagination
   */
  loadQuestions(): void {
    this.isLoading = true;

    const params = this.buildFilters();

    this.questionsService
      .getQuestions(params)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response: QuestionListResponse | null) =>
          this.handleQuestionsResponse(response),
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
  // CREATE QUESTION OPERATIONS
  // ================================

  /**
   * Open create question modal
   */
  onCreateQuestion(): void {
    this.editingQuestion = null;
    this.showCreateModal = true;
  }

  /**
   * Handle question creation
   */
  handleCreate(formData: FormData): void {
    this.isLoading = true;

    this.questionsService
      .createQuestion(formData)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Create question response:', response);
          this.handleCreateSuccess(response);
        },
      });
  }

  /**
   * Handle successful question creation
   */
  private handleCreateSuccess(response: any): void {
    this.showCreateModal = false;
    this.showAlert('success', 'Question created successfully!');
    this.loadQuestions();
  }

  /**
   * Handle question update
   */
  handleUpdate(formData: FormData): void {
    this.isLoading = true;

    this.questionsService
      .updateQuestion(formData)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Update question response:', response);
          this.handleUpdateSuccess(response);
        },
      });
  }

  /**
   * Handle successful question update
   */
  private handleUpdateSuccess(response: any): void {
    this.showCreateModal = false;
    this.showAlert('success', 'Question updated successfully!');
    this.loadQuestions();
  }

  /**
   * Close create question modal
   */
  closeCreateModal(): void {
    this.showCreateModal = false;
    this.editingQuestion = null;
  }

  // ================================
  // EDIT QUESTION OPERATIONS
  // ================================

  /**
   * Edit existing question
   */
  onEditQuestion(question: Question): void {
    this.editingQuestion = question;
    this.showCreateModal = true;
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
      // Remove from selections if it was selected
      this.selectedQuestionIds = this.selectedQuestionIds.filter(
        (id) => id !== questionId
      );
      this.loadQuestions();
    } else {
      this.showAlert('error', 'Failed to delete question.');
    }
  }

  // ================================
  // QUESTION ASSIGNMENT OPERATIONS
  // ================================

  /**
   * Open assignment modal
   */
  onAssignQuestion(): void {
    if (this.selectedQuestionIds.length === 0) {
      this.showAlert(
        'warning',
        'Please select at least one question to assign.'
      );
      return;
    }

    this.prepareAssignableQuestions();
    this.showAssignModal = true;
  }

  /**
   * Prepare questions for assignment
   */
  private prepareAssignableQuestions(): void {
    const selectedQuestions = this.getSelectedQuestions();
    this.assignableQuestions = selectedQuestions.map((q) => ({
      id: q.id,
      text: q.text,
      sectionId: null,
    }));
  }

  /**
   * Confirm question assignment
   */
  onAssignConfirm(event: { sectionId: number; questionIds: number[] }): void {
    this.isLoading = true;

    this.questionsService
      .assignQuestionToSection([event.sectionId], event.questionIds)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (success) => this.handleAssignSuccess(success, event.sectionId),
      });
  }

  /**
   * Handle successful assignment
   */
  private handleAssignSuccess(success: boolean, sectionId: number): void {
    if (success) {
      this.showAlert('success', 'Questions assigned successfully!');
      this.resetAfterAssign();
    } else {
      this.showAlert('error', 'Failed to assign questions.');
    }
  }

  /**
   * Reset state after assignment
   */
  private resetAfterAssign(): void {
    this.loadQuestions();
    this.selectedQuestionIds = [];
    this.showAssignModal = false;
  }

  /**
   * Close assignment modal
   */
  closeAssignModal(): void {
    this.showAssignModal = false;
  }

  private buildFilters(): any {
    return {
      PageNumber: this.currentPage,
      PageSize: this.pageSize,
      Search: this.searchQuery,
      type: this.filterData?.type,
      SectionId: this.filterData?.sectionId,
      PointId: this.filterData?.pointId,
    };
  }

  resetFilters(): void {
    this.filterData = {
      type: undefined,
      sectionId: undefined,
      pointId: undefined,
    };
    this.currentPage = 1;
    this.loadQuestions();
  }

  // Add these methods to handle filter modal
  openFilterModal(): void {
    this.showFilterModal = true;
  }

  closeFilterModal(): void {
    this.showFilterModal = false;
  }

  onFilterApplied(filterData: any): void {
    this.filterData = filterData;
    this.currentPage = 1; // Reset to first page when filters change
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
