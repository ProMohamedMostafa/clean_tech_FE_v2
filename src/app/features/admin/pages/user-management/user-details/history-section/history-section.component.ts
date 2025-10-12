import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditService } from '../../../../../auditor/services/audit.service';
import { getUserId } from '../../../../../../core/helpers/auth.helpers';
import { AuditDetailsModalComponent, AuditQuestion, AuditRecordInfo } from './audit-details-modal/audit-details-modal.component';

@Component({
  selector: 'app-history-section',
  standalone: true,
  imports: [CommonModule, AuditDetailsModalComponent],
  templateUrl: './history-section.component.html',
  styleUrls: ['./history-section.component.scss'],
})
export class HistorySectionComponent implements OnInit {
  @Input() userId: string | null = null;
  @Input() userRole: string | null = null;

  auditHistory: any | null = null;
  loading = false;
  errorMessage: string | null = null;

  // Modal properties
  showModal = false;
  modalLoading = false;
  selectedAuditQuestions: AuditQuestion[] = [];
  selectedRecordInfo: AuditRecordInfo | null = null;

  constructor(private auditService: AuditService) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    const targetUserId = this.userId || getUserId();

    if (!targetUserId) {
      this.errorMessage = 'User not found';
      return;
    }

    this.loading = true;
    this.auditService
      .getAuditAnswers({
        PageNumber: 1,
        PageSize: 20,
        UserId: +targetUserId,
      })
      .subscribe({
        next: (res) => {
          this.auditHistory = res;
          this.loading = false;
        },
        error: () => {
          this.errorMessage = 'Failed to load history';
          this.loading = false;
        },
      });
  }

  openAuditModal(record: any): void {
    this.selectedRecordInfo = {
      id: record.id,
      date: record.date,
      time: record.time,
      totalQuestionCount: record.totalQuestionCount,
      completedQuestionCount: record.completedQuestionCount
    };
    
    this.showModal = true;
    this.modalLoading = true;
    this.selectedAuditQuestions = [];

    this.auditService.getAuditAnswerById(record.id).subscribe({
      next: (response: any) => {
        if (response?.data?.questions) {
          this.selectedAuditQuestions = response.data.questions;
        }
        this.modalLoading = false;
      },
      error: () => {
        this.modalLoading = false;
        this.selectedAuditQuestions = [];
      },
    });
  }

  onCloseModal(): void {
    this.showModal = false;
    this.selectedAuditQuestions = [];
    this.selectedRecordInfo = null;
  }
}