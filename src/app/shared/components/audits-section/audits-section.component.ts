import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditHistoryItem } from '../../../features/auditor/models/audit.model';
import { AuditService } from '../../../features/auditor/services/audit.service';
import { QuestionsService } from '../../../features/admin/services/feedback/questions.service';
import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';
import { AuditModalComponent } from './audit-modal/audit-modal.component';

@Component({
  selector: 'app-audits-section',
  imports: [CommonModule, FormsModule, TranslateModule, AuditModalComponent],
  templateUrl: './audits-section.component.html',
  styleUrl: './audits-section.component.scss',
})
export class AuditsSectionComponent implements OnInit {
  @Input() auditId: number | null = null;
  @Input() sectionId: number | null = null;

  auditHistory: AuditHistoryItem[] = [];
  questions: any[] = [];

  showAuditModal = false;
  isSubmitting = false;
  isLoadingQuestions = false;

  isLoading = false;
  errorMessage = '';
  currentPage = 1;
  pageSize = 6;
  totalPages = 0;
  totalCount = 0;
  hasPreviousPage = false;
  hasNextPage = false;

  constructor(
    private auditService: AuditService,
    private questionsService: QuestionsService
  ) {}

  ngOnInit(): void {
    this.loadAuditHistory();
  }

  loadAuditHistory(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const filters: any = {
      PageNumber: this.currentPage,
      PageSize: this.pageSize,
    };

    if (this.auditId) {
      filters.AuditId = this.auditId;
    }

    this.auditService.getAuditAnswers(filters).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response && response.data) {
          this.auditHistory = response.data.data;
          this.currentPage = response.data.currentPage;
          this.totalPages = response.data.totalPages;
          this.totalCount = response.data.totalCount;
          this.hasPreviousPage = response.data.hasPreviousPage;
          this.hasNextPage = response.data.hasNextPage;
        } else {
          this.auditHistory = [];
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load audit history. Please try again.';
        console.error('Error loading audit history:', error);
      },
    });
  }

  onStartAudit(): void {
    this.loadQuestions();
  }

  loadQuestions(): void {
    if (!this.auditId) return;

    this.isLoadingQuestions = true;
    this.questionsService
      .getQuestions({
        PageNumber: 1,
        PageSize: 100,
        SectionUsageId: this.auditId,
      })
      .subscribe({
        next: (response) => {
          this.isLoadingQuestions = false;
          if (response && response.data && response.data.data) {
            this.questions = response.data.data;
            this.showAuditModal = true;
          } else {
            this.errorMessage = 'No questions found for this audit';
          }
        },
        error: (error) => {
          this.isLoadingQuestions = false;
          this.errorMessage = 'Failed to load questions. Please try again.';
          console.error('Error loading questions:', error);
        },
      });
  }

  onSubmitAudit(answers: any): void {
    if (!this.sectionId) return;

    this.isSubmitting = true;

    const auditAnswers = this.questions
      .map((question) => {
        let answerValue: any;

        switch (question.typeId) {
          case 0:
          case 3:
          case 4:
          case 5:
          case 6:
            answerValue = answers[question.id];
            break;
          case 1:
            answerValue = answers[question.id].join(',');
            break;
          case 2:
            answerValue = answers[question.id];
            break;
          default:
            answerValue = '';
        }

        return {
          questionId: question.id,
          answer: answerValue,
          type: question.typeId,
        };
      })
      .filter(
        (answer) =>
          answer.answer !== '' &&
          answer.answer !== null &&
          answer.answer !== undefined
      );

    const payload = {
      sectionId: this.sectionId,
      answers: auditAnswers,
    };

    this.auditService.postAuditAnswers(payload).subscribe({
      next: (success) => {
        this.isSubmitting = false;
        if (success) {
          this.showAuditModal = false;
          this.loadAuditHistory();

          // ✅ Success SweetAlert
          Swal.fire({
            icon: 'success',
            title: 'Submitted!',
            text: 'Audit answers have been submitted successfully.',
            confirmButtonColor: '#3085d6',
          });
        } else {
          this.errorMessage = 'Failed to submit audit. Please try again.';

          // ❌ Error SweetAlert
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to submit audit. Please try again.',
            confirmButtonColor: '#d33',
          });
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = 'Failed to submit audit. Please try again.';
        console.error('Error submitting audit:', error);

        // ❌ Error SweetAlert
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to submit audit. Please try again.',
          confirmButtonColor: '#d33',
        });
      },
    });
  }

  onCloseModal(): void {
    this.showAuditModal = false;
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadAuditHistory();
    }
  }

  onViewDetails(audit: AuditHistoryItem): void {
    console.log('View audit details:', audit);
  }
}
