// ===================================================================
// FEEDBACK DETAILS COMPONENT
// ===================================================================
// This component manages feedback device details and associated questions
// Provides CRUD operations for questions and device information display

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';

// ===================================================================
// SERVICES
// ===================================================================
import { FeedbackDeviceService } from '../../../../services/feedback/feedback.service';
import { QuestionsService } from '../../../../services/feedback/questions.service';

// ===================================================================
// COMPONENTS
// ===================================================================
import { FeedbackFilterBarComponent } from '../../../../components/feedback-module/feedback-filter-bar/feedback-filter-bar.component';
import { QuestionContainerComponent } from '../../../../components/feedback-module/question-container/question-container.component';
import { QuestionFilterComponent } from '../../../../components/feedback-module/question-filter/question-filter.component';
import { FeedbackNameLocationComponent } from '../../../../components/feedback-module/feedback-name-location/feedback-name-location.component';
import { AddFeedbackQuestionModalComponent } from '../../../../components/feedback-module/add-feedback-question-modal/add-feedback-question-modal.component';

// ===================================================================
// MODELS
// ===================================================================
import {
  Question,
  QuestionListResponse,
} from '../../../../models/feedback/question.model';
import { FeedbackDevice } from '../../../../models/feedback/feedback-device.model';
import { CreateFeedbackModalComponent } from '../../../../components/feedback-module/create-feedback-modal/create-feedback-modal.component';

@Component({
  selector: 'app-feedback-details',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FeedbackNameLocationComponent,
    FeedbackFilterBarComponent,
    QuestionContainerComponent,
    QuestionFilterComponent,
    AddFeedbackQuestionModalComponent,
    CreateFeedbackModalComponent,
  ],
  templateUrl: './feedback-details.component.html',
  styleUrl: './feedback-details.component.scss',
})
export class FeedbackDetailsComponent implements OnInit {
  // ===================================================================
  // FEEDBACK DEVICE PROPERTIES
  // ===================================================================
  feedbackId: string | null = null;
  deviceDetails: FeedbackDevice | null = null;
  feedbackName = '';
  locationData: { icon: string; title: string; value: string }[] = [];
  editingFeedback: { id: number; name: string; sectionId: number } | null =
    null; // Add this
  // ===================================================================
  // QUESTION MANAGEMENT PROPERTIES
  // ===================================================================
  questions: Question[] = [];
  editingQuestion: Question | null = null;
  selectedQuestionIds: number[] = [];
  assignableQuestions: {
    id: number;
    text: string;
    sectionId: number | null;
  }[] = [];

  // ===================================================================
  // PAGINATION & SEARCH PROPERTIES
  // ===================================================================
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  pageSize = 2;
  searchQuery = '';

  // ===================================================================
  // UI STATE PROPERTIES
  // ===================================================================
  isLoading = false;
  showFilterModal = false;
  showCreateModal = false;
  showAssignModal = false;
  showAddQuestionModal = false;

  // ===================================================================
  // USER & FILTER PROPERTIES
  // ===================================================================
  currentUserRole = 'Admin';
  organizationId?: number;
  buildingId?: number;
  floorId?: number;

  filterData: any = {
    type: undefined,
    sectionId: undefined,
    pointId: undefined,
  };

  // ===================================================================
  // CONSTRUCTOR & LIFECYCLE
  // ===================================================================
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private feedbackDeviceService: FeedbackDeviceService,
    private questionsService: QuestionsService
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  /**
   * Initialize component data on load
   */
  private initializeComponent(): void {
    this.feedbackId = this.route.snapshot.paramMap.get('id');

    if (this.feedbackId) {
      this.loadFeedbackDetails(+this.feedbackId);
    }

    this.loadQuestions();
  }

  // ===================================================================
  // FEEDBACK DEVICE OPERATIONS
  // ===================================================================

  /**
   * Load feedback device details by ID
   */
  loadFeedbackDetails(id: number): void {
    this.isLoading = true;

    this.feedbackDeviceService
      .getFeedbackDeviceById(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (details) => this.handleFeedbackDetailsSuccess(details),
        error: (error) => this.handleFeedbackDetailsError(error),
      });
  }

  /**
   * Handle successful feedback details loading
   */
  private handleFeedbackDetailsSuccess(details: FeedbackDevice | null): void {
    if (details) {
      this.deviceDetails = details;
      this.filterData.sectionId = details.sectionId;
      this.setupFeedbackDisplayData(details);
    }
  }

  /**
   * Setup feedback display data for UI components
   */
  private setupFeedbackDisplayData(details: FeedbackDevice): void {
    this.feedbackName = details.name;
    this.locationData = [
      {
        icon: 'fas fa-building',
        title: 'Organization',
        value: details.organizationName,
      },
      {
        icon: 'fas fa-city',
        title: 'Building',
        value: details.buildingName,
      },
      {
        icon: 'fas fa-layer-group',
        title: 'Floor',
        value: details.floorName,
      },
      {
        icon: 'fas fa-th-large',
        title: 'Section',
        value: details.sectionName,
      },
    ];
  }

  /**
   * Handle feedback details loading error
   */
  private handleFeedbackDetailsError(error: any): void {
    console.error('Error loading feedback details:', error);
    this.showAlert('error', 'Failed to load feedback details.');
  }

  // ===================================================================
  // QUESTION LOADING OPERATIONS
  // ===================================================================

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
        error: (error) => this.handleQuestionsLoadError(error),
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
  private handleQuestionsLoadError(error: any): void {
    console.error('Error loading questions:', error);
    this.showAlert(
      'error',
      'Failed to load questions. Please try again later.'
    );
  }

  // ===================================================================
  // SEARCH & PAGINATION HANDLERS
  // ===================================================================

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

  // ===================================================================
  // QUESTION SELECTION MANAGEMENT
  // ===================================================================

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

  // ===================================================================
  // QUESTION CREATE OPERATIONS
  // ===================================================================

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
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          console.log('Create question response:', response);
          this.handleCreateSuccess(response);
        },
        error: (error) => {
          console.error('Create question error:', error);
          this.handleCreateError(error);
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
   * Handle question creation error
   */
  private handleCreateError(error: any): void {
    this.showCreateModal = false;
    this.showAlert('error', 'Failed to create question. Please try again.');
  }

  /**
   * Close create question modal
   */

  // ===================================================================
  // QUESTION UPDATE OPERATIONS
  // ===================================================================

  /**
   * Edit existing question
   */

  /**
   * Handle question update
   */

  /**
   * Handle successful question update
   */
  private handleUpdateSuccess(response: any): void {
    this.showCreateModal = false;
    this.showAlert('success', 'Question updated successfully!');
    this.loadQuestions();
  }

  /**
   * Handle question update error
   */
  private handleUpdateError(error: any): void {
    this.showCreateModal = false;
    this.showAlert('error', 'Failed to update question. Please try again.');
  }

  // ===================================================================
  // QUESTION DELETE OPERATIONS
  // ===================================================================

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

    this.showDeleteConfirmation(message, () => this.executeBulkDelete());
  }

  /**
   * Delete single question with confirmation
   */
  onDeleteQuestion(questionOrId: number | Question): void {
    const questionId =
      typeof questionOrId === 'number' ? questionOrId : questionOrId.id;

    this.showDeleteConfirmation("You won't be able to revert this!", () =>
      this.executeSingleDelete(questionId)
    );
  }

  /**
   * Show delete confirmation dialog
   */
  private showDeleteConfirmation(message: string, onConfirm: () => void): void {
    Swal.fire({
      title: 'Are you sure?',
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        onConfirm();
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
   * Handle bulk delete error
   */
  private handleBulkDeleteError(error: any): void {
    console.error('Error deleting questions:', error);
    this.showAlert('error', 'An error occurred while deleting questions.');
  }

  /**
   * Handle single delete error
   */
  private handleSingleDeleteError(error: any): void {
    console.error('Error deleting question:', error);
    this.showAlert('error', 'An error occurred while deleting the question.');
  }

  // ===================================================================
  // QUESTION ASSIGNMENT OPERATIONS
  // ===================================================================

  /**
   * Open question assignment modal
   */
  onAssignQuestion(): void {
    this.showAddQuestionModal = true;
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
        error: (error) => this.handleAssignError(error),
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
   * Handle assignment error
   */
  private handleAssignError(error: any): void {
    console.error('Error assigning questions:', error);
    this.showAlert('error', 'An error occurred while assigning questions.');
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

  /**
   * Close add question modal
   */
  closeAddQuestionModal(): void {
    this.showAddQuestionModal = false;
  }

  // ===================================================================
  // FILTER OPERATIONS
  // ===================================================================

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
   * Apply filters and reload questions
   */
  onFilterApplied(filterData: any): void {
    this.filterData = filterData;
    this.currentPage = 1;
    this.loadQuestions();
    this.closeFilterModal();
  }

  /**
   * Reset all filters to default values
   */
  resetFilters(): void {
    this.filterData = {
      type: undefined,
      sectionId: undefined,
      pointId: undefined,
    };
    this.currentPage = 1;
    this.loadQuestions();
  }

  /**
   * Build filter parameters for API calls
   */
  private buildFilters(): any {
    return {
      PageNumber: this.currentPage,
      PageSize: this.pageSize,
      Search: this.searchQuery,
      type: this.filterData?.type,
      SectionId: this.filterData?.sectionId,
      PointId: this.filterData?.pointId,
      SectionUsageId: this.feedbackId,
    };
  }

  onEditQuestion(question: Question): void {
    this.editingQuestion = question;
    this.showCreateModal = true;
  }

  // ===================================================================
  // FEEDBACK DEVICE EDIT OPERATIONS
  // ===================================================================

  /**
   * Handle feedback device editing
   */
  handleEdit(feedbackData: {
    name: string;
    sectionId: number;
    feedbackDeviceId: number;
  }): void {
    if (!this.feedbackId) {
      this.showAlert('error', 'No feedback device selected for editing');
      return;
    }

    this.isLoading = true;

    const payload = {
      id: +this.feedbackId,
      name: feedbackData.name,
      sectionId: feedbackData.sectionId,
      feedbackDeviceId: feedbackData.feedbackDeviceId, // ✅ include device
      type: this.deviceDetails?.type || 0,
    };

    this.feedbackDeviceService
      .updateFeedbackDevice(payload)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response: any) => {
          const resData = response?.body || response;
          console.log('Update response:', resData);

          if (resData?.succeeded === true || resData?.succeeded === 'true') {
            this.showAlert(
              'success',
              resData.message || 'Operation successful'
            );

            if (this.feedbackId) {
              this.loadFeedbackDetails(+this.feedbackId);
            }

            this.closeCreateModal();
          } else {
            this.showAlert('error', resData?.message || 'Operation failed');
          }
        },
        error: (error) => {
          console.error('Error updating feedback device:', error);
          const errorMsg =
            error?.error?.message ||
            error?.message ||
            String(error) ||
            'Unknown error';
          this.showAlert('error', errorMsg);
        },
      });
  }

  /**
   * Open edit feedback device modal
   */
  onEditFeedbackDevice(): void {
    if (!this.deviceDetails) return;

    // Set up the editing state - you'll need to pass this to your modal component
    this.editingFeedback = {
      id: +this.feedbackId!,
      name: this.deviceDetails.name,
      sectionId: this.deviceDetails.sectionId,
    };

    this.showCreateModal = true;
  }

  /**
   * Close modal and reset editing state
   */
  closeCreateModal(): void {
    this.showCreateModal = false;
    this.editingQuestion = null;
    this.editingFeedback = null; // Reset feedback editing state
  }

  /**
   * Delete a feedback device with confirmation
   */
  onDeleteFeedback(feedback: FeedbackDevice): void {
    if (!feedback?.id) return;

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
        this.feedbackDeviceService.deleteFeedbackDevice(feedback.id).subscribe({
          next: (success) => {
            if (success) {
              this.showAlert(
                'success',
                'Feedback device deleted successfully!'
              );
              this.router.navigate(['/admin/feedback']); // navigate after delete
            } else {
              this.showAlert('error', 'Failed to delete feedback device.');
            }
          },
          error: (error) => {
            console.error('Error deleting feedback device:', error);
            this.showAlert('error', 'Error deleting feedback device.');
          },
        });
      }
    });
  }

  // ===================================================================
  // UTILITY & HELPER METHODS
  // ===================================================================

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
