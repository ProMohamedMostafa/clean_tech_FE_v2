// ==================== ANGULAR CORE & COMMON MODULES ====================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

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
} from '../../../../../../../shared/components/table-data/table-data.component';
import { ReusableFilterBarComponent } from '../../../../../../../shared/components/filter-bar/filter-bar.component';
import { PageTitleComponent } from '../../../../../../../shared/components/page-title/page-title.component';
import { FeedbackDeviceService } from '../../../../../services/feedback/feedback.service';
import { getUserRole } from '../../../../../../../core/helpers/auth.helpers';

// ==================== SERVICES & MODELS ====================

// ==================== CUSTOM COMPONENTS ====================

// ==================== HELPERS ====================

/**
 * Statistics Table Component
 * - Handles displaying home statistics with pagination, filtering, and export functionality
 * - Supports PDF & Excel export
 * - Designed as standalone component for modularity
 */
@Component({
  selector: 'app-statistics-table',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TableDataComponent,
    ReusableFilterBarComponent,
  ],
  templateUrl: './statistics-table.component.html',
  styleUrls: ['./statistics-table.component.scss'],
})
export class StatisticsTableComponent implements OnInit {
  // ==================== STATE & UI PROPERTIES ====================
  searchData: string = '';
  showFilterModal: boolean = false;

  // Pagination properties
  statisticsData: any[] = [];
  currentPage: number = 1;
  pageSize: number | undefined = 10;
  totalPages: number = 1;
  totalCount: number = 0;
  currentUserRole: string = '';
  private searchTimeout: any;

  // Table configuration
  tableColumns: TableColumn[] = [
    { key: 'name', label: 'STATISTICS_TABLE.NAME', type: 'text' },
    {
      key: 'totalDevice',
      label: 'STATISTICS_TABLE.TOTAL_DEVICES',
      type: 'text',
    },
    {
      key: 'totalSensor',
      label: 'STATISTICS_TABLE.TOTAL_SENSORS',
      type: 'text',
    },
    {
      key: 'totalAnswer',
      label: 'STATISTICS_TABLE.TOTAL_ANSWERS',
      type: 'text',
    },
    {
      key: 'totalAuditor',
      label: 'STATISTICS_TABLE.TOTAL_AUDITORS',
      type: 'text',
    },
    {
      key: 'totalCleaner',
      label: 'STATISTICS_TABLE.TOTAL_CLEANERS',
      type: 'text',
    },
    { key: 'rate', label: 'STATISTICS_TABLE.SATISFACTION_RATE', type: 'text' },
  ];

  // Table actions with role-based conditions

  // ==================== CONSTRUCTOR ====================
  constructor(private feedbackDeviceService: FeedbackDeviceService) {}

  // ==================== LIFECYCLE ====================
  ngOnInit(): void {
    this.currentUserRole = getUserRole();
    this.loadStatistics();
  }

  // ==================== DATA LOADING ====================

  /**
   * Load statistics with current filters & pagination
   */
  loadStatistics(): void {
    const filters = this.buildFilters();

    this.feedbackDeviceService.getHomeStatistics(filters).subscribe({
      next: (response) => {
        if (response) {
          this.updateStatisticsData(response);
        } else {
          this.handleEmptyResponse();
        }
      },
      error: (error) => {
        this.handleError('Failed to load statistics');
        console.error('Statistics loading error:', error);
      },
    });
  }

  /**
   * Update component state with paginated data
   */
  private updateStatisticsData(data: any): void {
    this.statisticsData = data.data || [];
    this.currentPage = data.currentPage || 1;
    this.totalPages = data.totalPages || 1;
    this.totalCount = data.totalCount || 0;
    this.pageSize = data.pageSize || 10;
  }

  /**
   * Handle empty response from API
   */
  private handleEmptyResponse(): void {
    this.statisticsData = [];
    this.currentPage = 1;
    this.totalPages = 1;
    this.totalCount = 0;
    this.showInfo('No statistics data available');
  }

  // ==================== EVENT HANDLERS ====================

  onSearchChange(searchTerm: string): void {
    clearTimeout(this.searchTimeout); // reset previous timer

    this.searchTimeout = setTimeout(() => {
      this.searchData = searchTerm;
      this.currentPage = 1;
      this.loadStatistics(); // only fires after 500ms of no typing
    }, 500); // delay in ms
  }

  onFilterApplied(): void {
    // Implement filter logic if needed
    this.currentPage = 1;
    this.loadStatistics();
    this.showFilterModal = false;
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadStatistics();
  }

  onPageSizeChange(size: number | undefined): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadStatistics();
  }

  // ==================== EXPORT & PRINT ====================

downloadAsPDF(): void {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(16);
  doc.text('Statistics Report', 14, 15);

  // Build table
  autoTable(doc, {
    startY: 20,
    head: [[
      'Name',
      'Total Devices',
      'Total Sensors',
      'Total Answers',
      'Total Auditors',
      'Total Cleaners',
      'Satisfaction Rate',
    ]],
    body: this.statisticsData.map((item) => [
      item.name || 'N/A',
      item.totalDevice || 0,
      item.totalSensor || 0,
      item.totalAnswer || 0,
      item.totalAuditor || 0,
      item.totalCleaner || 0,
      `${item.rate || 0}%`,
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 139, 202] },
  });

  doc.save('statistics-report.pdf');
}

downloadAsExcel(): void {
  const worksheet = XLSX.utils.json_to_sheet(
    this.statisticsData.map((item) => ({
      Name: item.name || 'N/A',
      'Total Devices': item.totalDevice || 0,
      'Total Sensors': item.totalSensor || 0,
      'Total Answers': item.totalAnswer || 0,
      'Total Auditors': item.totalAuditor || 0,
      'Total Cleaners': item.totalCleaner || 0,
      'Satisfaction Rate': `${item.rate || 0}%`,
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Statistics');
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  FileSaver.saveAs(new Blob([buffer]), 'statistics-report.xlsx');
}

printPDF(): void {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('Statistics Report', 14, 15);

  autoTable(doc, {
    startY: 20,
    head: [[
      'Name',
      'Total Devices',
      'Total Sensors',
      'Total Answers',
      'Total Auditors',
      'Total Cleaners',
      'Satisfaction Rate',
    ]],
    body: this.statisticsData.map((item) => [
      item.name || 'N/A',
      item.totalDevice || 0,
      item.totalSensor || 0,
      item.totalAnswer || 0,
      item.totalAuditor || 0,
      item.totalCleaner || 0,
      `${item.rate || 0}%`,
    ]),
  });

  const pdfWindow = window.open(doc.output('bloburl'), '_blank');
  pdfWindow?.focus();
  pdfWindow?.print();
}


  // ==================== TABLE ACTIONS ====================

  viewStatisticsDetails(item: any): void {
    // Navigate to detailed statistics view
    this.showSuccess(`Viewing details for ${item.name || 'selected item'}`);
    // Implement navigation logic here
    // this.router.navigate(['/statistics', item.id]);
  }

  exportItemData(item: any): void {
    // Export individual item data
    const worksheet = XLSX.utils.json_to_sheet([item]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Item Data');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    FileSaver.saveAs(
      new Blob([buffer]),
      `statistics-${item.id || 'item'}.xlsx`
    );
  }

  // ==================== HELPER METHODS ====================

  private buildFilters(): any {
    return {
      PageNumber: this.currentPage,
      PageSize: this.pageSize,
      SearchQuery: this.searchData || '',
    };
  }

  private formatDate(dateString: string): string {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  }

  private showSuccess(message: string): void {
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: message,
      timer: 2000,
      showConfirmButton: false,
    });
  }

  private showInfo(message: string): void {
    Swal.fire({
      icon: 'info',
      title: 'Information',
      text: message,
      timer: 3000,
      showConfirmButton: false,
    });
  }

  private handleError(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
    });
  }

  isAdmin(): boolean {
    return this.currentUserRole === 'Admin';
  }

  isManager(): boolean {
    return this.currentUserRole === 'Manager';
  }

  openFilterModal(): void {
    this.showFilterModal = true;
  }

  closeFilterModal(): void {
    this.showFilterModal = false;
  }

  // Refresh data
  refreshData(): void {
    this.currentPage = 1;
    this.loadStatistics();
  }
}
