import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { QuestionContainerComponent } from '../../../../../../../components/feedback-module/question-container/question-container.component';
import { SectionQuestion } from '../../../../../../../models/feedback/feedback-device.model';
import { QuestionsService } from '../../../../../../../services/feedback/questions.service';

@Component({
  selector: 'app-point-assign-modal',
  imports: [TranslateModule, QuestionContainerComponent, CommonModule],
  templateUrl: './point-assign-modal.component.html',
  styleUrl: './point-assign-modal.component.scss',
})
export class PointAssignModalComponent implements OnInit {
  @Input() sectionId!: number; // Section ID
  @Input() pointId!: number; // Point ID
  @Input() sectionUsageId!: number; // Usage ID (لو هتحتاجه لحاجات تانية)

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>(); // emit بعد الحفظ

  questions: any[] = [];
  selectedQuestionIds: number[] = [];

  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  pageSize = 5;
  loading = false;

  constructor(private questionsService: QuestionsService) {}

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions(): void {
    this.loading = true;
    this.questionsService
      .getQuestions({
        PageNumber: this.currentPage,
        PageSize: this.pageSize,
        SectionId: this.sectionId,
        PointId: this.pointId,
        IsHidden: true,
      })
      .subscribe({
        next: (response) => {
          if (response && response.data?.data) {
            this.questions = response.data.data;
            this.totalCount = response.data.totalCount ?? 0;
            this.totalPages = Math.ceil(this.totalCount / this.pageSize);

            this.updateSelectedQuestionsFromResponse();
          } else {
            this.questions = [];
            this.totalCount = 0;
            this.totalPages = 1;
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load questions. Please try again.',
          });
        },
      });
  }

  private updateSelectedQuestionsFromResponse(): void {
    const checkedQuestionIds = this.questions
      .filter((question) => question.isChecked)
      .map((question) => question.id);

    checkedQuestionIds.forEach((id) => {
      if (!this.selectedQuestionIds.includes(id)) {
        this.selectedQuestionIds.push(id);
      }
    });
  }

  onUnassignPreChecked(questionId: number): void {
    this.selectedQuestionIds = this.selectedQuestionIds.filter(
      (id) => id !== questionId
    );
    const question = this.questions.find((q) => q.id === questionId);
    if (question) question.isChecked = false;
  }

  onPageChange(newPage: number): void {
    if (
      newPage !== this.currentPage &&
      newPage >= 1 &&
      newPage <= this.totalPages
    ) {
      this.currentPage = newPage;
      this.loadQuestions();
    }
  }

  onPageSizeChange(newSize: number): void {
    if (newSize !== this.pageSize) {
      this.pageSize = newSize;
      this.currentPage = 1;
      this.loadQuestions();
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

    this.loading = true;
    this.questionsService
      .assignQuestionsToPoint(this.pointId, this.selectedQuestionIds)
      .subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Assigned',
            text: 'Questions assigned successfully!',
            timer: 1500,
            showConfirmButton: false,
          });
          this.saved.emit();
          this.onClose();
        },
        error: () => {
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to assign questions. Please try again.',
          });
        },
      });
  }

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

  isQuestionSelected(questionId: number): boolean {
    return this.selectedQuestionIds.includes(questionId);
  }
}
