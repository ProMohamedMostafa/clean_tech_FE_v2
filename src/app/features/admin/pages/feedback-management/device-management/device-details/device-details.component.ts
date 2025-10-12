// ==================== ANGULAR CORE & COMMON MODULES ====================
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ==================== THIRD-PARTY LIBRARIES ====================
import { TranslateModule } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import {
  TableAction,
  TableColumn,
  TableDataComponent,
} from '../../../../../../shared/components/table-data/table-data.component';
import { ReusableFilterBarComponent } from '../../../../../../shared/components/filter-bar/filter-bar.component';
import { PageTitleComponent } from '../../../../../../shared/components/page-title/page-title.component';
import { AnswersService } from '../../../../services/feedback/answers.service';
import { getUserRole } from '../../../../../../core/helpers/auth.helpers';
import { DeviceAnswerFilterComponent } from '../../../../components/feedback-module/device-answer-filter/device-answer-filter.component';
import { SessionDetailsModalComponent } from '../../../../components/feedback-module/app-session-details-modal/app-session-details-modal.component';

// ==================== SERVICES & MODELS ====================

// ==================== CUSTOM COMPONENTS ====================

// ==================== HELPERS ====================

/**
 * Device Details Component
 * - Handles displaying feedback sessions for a specific device
 * - Supports pagination, filtering, and export functionality
 */
@Component({
  selector: 'app-device-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    TableDataComponent,
    ReusableFilterBarComponent,
    PageTitleComponent,
    DeviceAnswerFilterComponent,
    SessionDetailsModalComponent,
  ],
  templateUrl: './device-details.component.html',
  styleUrls: ['./device-details.component.scss'],
})
export class DeviceDetailsComponent implements OnInit {
  // ==================== STATE & UI PROPERTIES ====================
  searchData: string = '';
  filterData: any = {};
  showFilterModal: boolean = false;
  deviceId!: number;
  deviceName: string = 'Unknown Device';
  showSessionModal: boolean = false;
  selectedSessionData: any = null;
  // Pagination properties
  feedbackSessions: any[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  totalCount: number = 0;
  currentUserRole: string = '';

  // Table configuration
tableColumns: TableColumn[] = [
  {
    key: 'rowNumber',
    label: 'feedback.NUMBER',
    type: 'text',
  },
  { key: 'date', label: 'feedback.DATE', type: 'text' },
  { key: 'time', label: 'feedback.TIME', type: 'text' },
  {
    key: 'questionStats',
    label: 'feedback.QUESTIONS_COMPLETED',
    type: 'text',
  },
];


  // Table actions
  tableActions: TableAction[] = [
    {
      icon: 'fas fa-eye',
      label: 'View Session Details',
      action: (session) => this.viewSessionDetails(session.id),
      condition: () => true,
    },
  ];

  // ==================== CONSTRUCTOR ====================
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private answersService: AnswersService
  ) {}

  // ==================== LIFECYCLE ====================
  ngOnInit(): void {
    this.currentUserRole = getUserRole();
    this.deviceId = +this.route.snapshot.params['id'];
    this.loadDeviceSessions();
  }

  // ==================== DATA LOADING ====================

  /**
   * Load feedback sessions for the current device with filters & pagination
   */
  loadDeviceSessions(): void {
    const filters = this.buildFilters();
    filters.FeedbackDeviceId = this.deviceId;

    this.answersService.getAnswers(filters).subscribe((response) => {
      if (response && response.succeeded) {
        this.updateSessionData(response.data);
      } else {
        this.showError('Failed to load device sessions');
      }
    });
  }

  /**
   * Update component state with paginated data
   */
  // Update the updateSessionData method to include the formatted property
  // Update the updateSessionData method to include row numbers
  private updateSessionData(data: any): void {
    const startIndex = (this.currentPage - 1) * this.pageSize + 1;

    this.feedbackSessions = (data.data || []).map(
      (session: any, index: number) => ({
        ...session,
        rowNumber: startIndex + index,
        completionRate: this.calculateCompletionRate(session),
        questionStats: `${session.completedQuestionCount} out of ${session.totalQuestionCount}`,
        completionRateDisplay: `${this.calculateCompletionRate(session).toFixed(
          1
        )}%`,
      })
    );

    this.currentPage = data.currentPage || 1;
    this.totalPages = data.totalPages || 1;
    this.totalCount = data.totalCount || 0;
    this.pageSize = data.pageSize || 10;
  }

  private calculateCompletionRate(session: any): number {
    if (session.totalQuestionCount === 0) return 0;
    return (session.completedQuestionCount / session.totalQuestionCount) * 100;
  }

  // ==================== EVENT HANDLERS ====================

  onSearchChange(searchTerm: string): void {
    this.searchData = searchTerm;
    this.currentPage = 1;
    this.loadDeviceSessions();
  }

  onFilterApplied(filterObj: any): void {
    this.filterData = { ...filterObj };
    this.currentPage = 1;
    this.loadDeviceSessions();
    this.showFilterModal = false;
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadDeviceSessions();
  }

  onPageSizeChange(size: number | undefined): void {
    this.pageSize = size || 10;
    this.currentPage = 1;
    this.loadDeviceSessions();
  }

  // ==================== EXPORT & PRINT ====================

  downloadAsPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        [
          'Date',
          'Time',
          'Total Questions',
          'Completed Questions',
          'Completion Rate',
        ],
      ],
      body: this.feedbackSessions.map((session) => [
        session.date,
        session.time,
        session.totalQuestionCount.toString(),
        session.completedQuestionCount.toString(),
        `${session.completionRate.toFixed(1)}%`,
      ]),
    });
    doc.save(`device-${this.deviceId}-sessions.pdf`);
  }

  downloadAsExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(
      this.feedbackSessions.map((session) => ({
        Date: session.date,
        Time: session.time,
        'Total Questions': session.totalQuestionCount,
        'Completed Questions': session.completedQuestionCount,
        'Completion Rate': `${session.completionRate.toFixed(1)}%`,
        'Session ID': session.id,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sessions');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    FileSaver.saveAs(
      new Blob([buffer]),
      `device-${this.deviceId}-sessions.xlsx`
    );
  }

  printPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        [
          'Date',
          'Time',
          'Total Questions',
          'Completed Questions',
          'Completion Rate',
        ],
      ],
      body: this.feedbackSessions.map((session) => [
        session.date,
        session.time,
        session.totalQuestionCount.toString(),
        session.completedQuestionCount.toString(),
        `${session.completionRate.toFixed(1)}%`,
      ]),
    });
    const pdfWindow = window.open(doc.output('bloburl'), '_blank');
    pdfWindow?.focus();
    pdfWindow?.print();
  }

  // ==================== SESSION ACTIONS ====================

  viewSessionDetails(sessionId: number): void {
    this.answersService.getAnswerById(sessionId).subscribe({
      next: (response) => {
        if (response) {
          this.selectedSessionData = response;
          this.showSessionModal = true;
        } else {
          this.showError('Failed to load session details');
        }
      },
      error: (err) => {
        console.error('Error loading session details:', err);
        this.showError('Failed to load session details');
      },
    });
  }

  closeSessionModal(): void {
    this.showSessionModal = false;
    this.selectedSessionData = null;
  }

  // ==================== HELPER METHODS ====================

  isAdmin(): boolean {
    return this.currentUserRole === 'Admin';
  }

  isManager(): boolean {
    return this.currentUserRole === 'Manager';
  }

  private buildFilters(): any {
    const f = this.filterData;
    return {
      PageNumber: this.currentPage,
      PageSize: this.pageSize,
      Search: this.searchData || '',
      Date: f.selectedDate,
      BuildingId: f.selectedBuilding,
      FloorId: f.selectedFloor,
      SectionId: f.selectedSection,
      FeedbackDeviceId: this.deviceId,
    };
  }

  private showError(message: string): void {
    Swal.fire({ icon: 'error', title: 'Error', text: message });
  }

  private showSuccess(message: string): void {
    Swal.fire({ icon: 'success', title: 'Success', text: message });
  }

  private getBaseRouteByRole(): string {
    const roles: Record<string, string> = {
      Admin: 'admin',
      Manager: 'manager',
      Supervisor: 'supervisor',
      Cleaner: 'cleaner',
    };
    return roles[this.currentUserRole] || 'admin';
  }

  openFilterModal(): void {
    this.showFilterModal = true;
  }

  closeFilterModal(): void {
    this.showFilterModal = false;
  }
}
