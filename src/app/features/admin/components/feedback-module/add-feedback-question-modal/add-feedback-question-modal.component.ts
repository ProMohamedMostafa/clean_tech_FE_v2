import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { QuestionContainerComponent } from '../question-container/question-container.component';
import { QuestionsService } from '../../../services/feedback/questions.service';
import { Question } from '../../../models/feedback/question.model';
import { FeedbackDeviceService } from '../../../services/feedback/feedback.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { SectionQuestion } from '../../../models/feedback/feedback-device.model';

@Component({
  selector: 'app-add-feedback-question-modal',
  standalone: true,
  imports: [TranslateModule, QuestionContainerComponent, CommonModule],
  templateUrl: './add-feedback-question-modal.component.html',
  styleUrls: ['./add-feedback-question-modal.component.scss'],
})
export class AddFeedbackQuestionModalComponent implements OnInit {
  @Input() sectionId!: number; // Section ID for reference
  @Input() sectionUsageId!: number; // Usage ID for assignment
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>(); // emit after successful assignment

  questions: SectionQuestion[] = [];
  selectedQuestionIds: number[] = [];

  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  pageSize = 5;

  constructor(
    private questionsService: QuestionsService,
    private feedbackDeviceService: FeedbackDeviceService
  ) {}

  ngOnInit(): void {
    this.loadSectionQuestions();
  }

  loadSectionQuestions(): void {
    const filters = {
      SectionId: this.sectionId,
      SectionUsageId: this.sectionUsageId,
      PageNumber: this.currentPage,
      PageSize: this.pageSize,
      Search: '',
    };

    this.feedbackDeviceService
      .getSectionQuestions(filters)
      .subscribe((response) => {
        if (response && response.succeeded && response.data) {
          this.questions = response.data.data;
          this.totalCount = response.data.totalCount;
          this.pageSize = response.data.pageSize;
          this.currentPage = response.data.currentPage;
          this.totalPages = response.data.totalPages;

          this.updateSelectedQuestionsFromResponse();
        } else {
          this.questions = [];
          this.totalCount = 0;
          this.totalPages = 1;
        }
      });
  }

  private updateSelectedQuestionsFromResponse(): void {
    const checkedQuestionIds = this.questions
      .filter((question) => question.isChecked)
      .map((question) => question.id);

    // Add checked questions to selected list (avoid duplicates)
    checkedQuestionIds.forEach((id) => {
      if (!this.selectedQuestionIds.includes(id)) {
        this.selectedQuestionIds.push(id);
      }
    });
  }

  onUnassignPreChecked(questionId: number): void {
    // Remove from selected questions
    this.selectedQuestionIds = this.selectedQuestionIds.filter(
      (id) => id !== questionId
    );

    // Optional: You might want to update the question's isChecked state locally
    const question = this.questions.find((q) => q.id === questionId);
    if (question) {
      question.isChecked = false;
    }

    console.log(`Question ${questionId} unassigned from selection`);
  }

  onPageChange(newPage: number): void {
    if (
      newPage !== this.currentPage &&
      newPage >= 1 &&
      newPage <= this.totalPages
    ) {
      this.currentPage = newPage;
      this.loadSectionQuestions();
    }
  }

  onPageSizeChange(newSize: number): void {
    if (newSize !== this.pageSize) {
      this.pageSize = newSize;
      this.currentPage = 1;
      this.loadSectionQuestions();
    }
  }

  onClose() {
    this.close.emit();
  }

  onSave() {
    if (!this.selectedQuestionIds.length) {
      Swal.fire({
        icon: 'warning',
        title: 'No Questions Selected',
        text: 'Please select at least one question to assign.',
        confirmButtonText: 'OK',
      });
      return;
    }

    const payload = {
      sectionUsageId: this.sectionUsageId,
      questionIds: this.selectedQuestionIds,
    };

    this.feedbackDeviceService.assignQuestions(payload).subscribe({
      next: (success) => {
        if (success) {
          // Show success alert
          Swal.fire({
            icon: 'success',
            title: 'Assigned Successfully!',
            text: `${this.selectedQuestionIds.length} question(s) assigned.`,
            confirmButtonText: 'OK',
          }).then(() => {
            // Emit event to parent to reload questions
            this.saved.emit();
            // Close modal
            this.close.emit();
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Assignment Failed',
            text: 'Failed to assign questions. Please try again.',
            confirmButtonText: 'OK',
          });
        }
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An unexpected error occurred while assigning questions.',
          confirmButtonText: 'OK',
        });
      },
    });
  }

  // Handle individual question selection changes
  onQuestionSelectionChanged(event: {
    questionId: number;
    isSelected: boolean;
  }) {
    const { questionId, isSelected } = event;

    if (isSelected) {
      if (!this.selectedQuestionIds.includes(questionId)) {
        this.selectedQuestionIds.push(questionId);
      }
    } else {
      this.selectedQuestionIds = this.selectedQuestionIds.filter(
        (id) => id !== questionId
      );
    }
  }

  // Handle select all changes
  onSelectAllChanged(isSelected: boolean) {
    const currentPageQuestionIds = this.questions.map((q) => q.id);
    if (isSelected) {
      currentPageQuestionIds.forEach((id) => {
        if (!this.selectedQuestionIds.includes(id)) {
          this.selectedQuestionIds.push(id);
        }
      });
    } else {
      this.selectedQuestionIds = this.selectedQuestionIds.filter(
        (id) => !currentPageQuestionIds.includes(id)
      );
    }
  }

  // Check if a question is selected (for maintaining selection across pages)
  isQuestionSelected(questionId: number): boolean {
    return this.selectedQuestionIds.includes(questionId);
  }
}
