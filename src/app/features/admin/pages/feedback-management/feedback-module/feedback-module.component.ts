import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { finalize } from 'rxjs';

// Components
import { FeedbackFilterBarComponent } from '../../../components/feedback-module/feedback-filter-bar/feedback-filter-bar.component';
import { FeedbackContainerComponent } from '../../../components/feedback-module/feedback-container/feedback-container.component';
import { PageTitleComponent } from '../../../../../shared/components/page-title/page-title.component';
import { CreateFeedbackModalComponent } from '../../../components/feedback-module/create-feedback-modal/create-feedback-modal.component';
import { FeedbackDevice } from '../../../models/feedback/feedback-device.model';
import { FeedbackDeviceService } from '../../../services/feedback/feedback.service';
import { FeedbackFilterComponent } from '../../../components/feedback-module/feedback-filter/feedback-filter.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-feedback-module',
  templateUrl: './feedback-module.component.html',
  styleUrls: ['./feedback-module.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    PageTitleComponent,
    FeedbackFilterBarComponent,
    FeedbackContainerComponent,
    CreateFeedbackModalComponent,
    FeedbackFilterComponent,
  ],
})
export class FeedbackModuleComponent implements OnInit {
  showFilterModal = false;

  // Component state properties
  isLoading = false;
  currentUserRole = 'Admin';
  showCreateModal = false;
  contentType: 'feedback' | 'audits' = 'feedback';

  // Modal mode and edit data
  modalMode: 'create' | 'edit' = 'create';
  editingFeedback: FeedbackDevice | null = null;

  // Feedback data - initialized as empty array
  feedbacks: any[] = [];
  selectedFeedbackIds: number[] = [];

  // Pagination
  currentPage = 1;
  totalPages = 0;
  totalCount = 0;
  pageSize = 8;

  // Search
  searchQuery = '';

  filters: any = {
    sectionId: undefined,
  };

  constructor(
    private feedbackDeviceService: FeedbackDeviceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFeedbacks();
  }

  // ================================
  // DATA LOADING METHODS
  // ================================

  loadFeedbacks(): void {
    this.isLoading = true;

    const filters = {
      PageNumber: this.currentPage,
      PageSize: this.pageSize,
      Search: this.searchQuery,
      Type: this.contentType === 'feedback' ? 0 : 1,
      sectionId: this.filters.sectionId,
    };

    this.feedbackDeviceService
      .getFeedbackDevices(filters)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response: any | null) => {
          if (response?.succeeded && response.data?.data) {
            this.feedbacks = response.data.data || [];
            this.totalCount = response.data.totalCount || 0;
            this.totalPages = response.data.totalPages || 0;
          } else {
            this.resetFeedbackData();
          }
        },
      });
  }

  private resetFeedbackData(): void {
    this.feedbacks = [];
    this.totalCount = 0;
    this.totalPages = 0;
    this.currentPage = 1;
  }

  // Add this new method to allow manual refreshing
  refreshFeedbacks(): void {
    this.currentPage = 1;
    this.loadFeedbacks();
  }

  // ================================
  // CREATE/EDIT FEEDBACK OPERATIONS
  // ================================

  onCreateFeedback(): void {
    this.modalMode = 'create';
    this.editingFeedback = null;
    this.showCreateModal = true;
  }

  handleCreate(feedbackData: {
    name: string;
    sectionId: number;
    feedbackDeviceId: number;
  }): void {
    this.isLoading = true;

    const payload = {
      name: feedbackData.name,
      sectionId: feedbackData.sectionId,
      feedbackDeviceId: feedbackData.feedbackDeviceId,
      type: this.contentType === 'feedback' ? 0 : 1,
    };

    this.feedbackDeviceService
      .createFeedbackDevice(payload)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          if (response?.succeeded) {
            this.showAlert(
              'success',
              response.message || 'Feedback device created successfully!'
            );
            this.loadFeedbacks();
            this.closeCreateModal();
          } else {
            this.showAlert(
              'error',
              response?.message || 'Failed to create feedback device'
            );
          }
        },
      });
  }

  handleEdit(feedbackData: {
    name: string;
    sectionId: number;
    feedbackDeviceId: number;
  }): void {
    if (!this.editingFeedback?.id) return;

    this.isLoading = true;

    const payload = {
      id: this.editingFeedback.id,
      name: feedbackData.name,
      sectionId: feedbackData.sectionId,
      feedbackDeviceId: feedbackData.feedbackDeviceId,
      type: this.contentType === 'feedback' ? 0 : 1,
    };

    this.feedbackDeviceService
      .updateFeedbackDevice(payload)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          if (response?.succeeded) {
            this.showAlert(
              'success',
              response.message || 'Feedback device updated successfully!'
            );
            this.loadFeedbacks();
            this.closeCreateModal();
          } else {
            this.showAlert(
              'error',
              response?.message || 'Failed to update feedback device'
            );
          }
        },
      });
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.modalMode = 'create';
    this.editingFeedback = null;
  }

  // ================================
  // SEARCH & PAGINATION HANDLERS
  // ================================

  onSearchChange(searchTerm: string): void {
    this.searchQuery = searchTerm;
    this.currentPage = 1;
    this.loadFeedbacks();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadFeedbacks();
  }

  onPageSizeChange(newPageSize: number): void {
    this.pageSize = newPageSize;
    this.currentPage = 1;
    this.loadFeedbacks();
  }

  // ================================
  // CONTENT TYPE HANDLER
  // ================================

  onContentTypeChange(type: 'feedback' | 'audits'): void {
    this.contentType = type;
    this.currentPage = 1;
    this.loadFeedbacks();
  }

  // ================================
  // FEEDBACK OPERATIONS
  // ================================

  onEditFeedback(feedback: FeedbackDevice): void {
    this.modalMode = 'edit';
    this.editingFeedback = feedback;
    this.showCreateModal = true;
  }

  onViewFeedback(feedback: FeedbackDevice): void {
    if (!feedback.id) return;
    this.router.navigate(['admin/feedback', feedback.id]);
  }

  onDeleteFeedback(feedback: FeedbackDevice): void {
    if (!feedback.id) return;

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
        this.feedbackDeviceService
          .deleteFeedbackDevice(feedback.id!)
          .subscribe({
            next: (success) => {
              if (success) {
                this.showAlert(
                  'success',
                  'Feedback device deleted successfully!'
                );
                this.loadFeedbacks();
              } else {
                this.showAlert('error', 'Failed to delete feedback device');
              }
            },
          });
      }
    });
  }

  onBulkDelete(): void {
    if (this.selectedFeedbackIds.length === 0) {
      this.showAlert(
        'warning',
        'Please select at least one feedback device to delete.'
      );
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: `You're about to delete ${this.selectedFeedbackIds.length} feedback devices.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete them!',
    }).then((result) => {
      if (result.isConfirmed) {
        const deleteObservables = this.selectedFeedbackIds.map((id) =>
          this.feedbackDeviceService.deleteFeedbackDevice(id)
        );

        deleteObservables[0].subscribe({
          next: (success) => {
            if (success) {
              this.showAlert(
                'success',
                `${this.selectedFeedbackIds.length} feedback devices deleted successfully!`
              );
              this.selectedFeedbackIds = [];
              this.loadFeedbacks();
            } else {
              this.showAlert('error', 'Failed to delete some feedback devices');
            }
          },
        });
      }
    });
  }

  // ================================
  // FILTER METHODS
  // ================================

  openFilterModal(): void {
    this.showFilterModal = true;
  }

  onFilterChange(filters: any): void {
    this.filters = {
      ...this.filters,
      ...filters,
    };

    this.currentPage = 1;
    this.loadFeedbacks();
    this.showFilterModal = false;
  }

  // ================================
  // UTILITY METHODS
  // ================================

  isAdmin(): boolean {
    return this.currentUserRole === 'Admin';
  }

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
