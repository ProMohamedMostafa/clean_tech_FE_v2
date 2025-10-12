import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AttendanceService } from '../../../services/attendance.service';
import { formatDuration, parseUtcToLocal } from '../../../../../core/helpers/date-time.utils';

@Component({
  selector: 'app-admin-attendance-table',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './attendance-table.component.html',
  styleUrl: './attendance-table.component.css',
})
export class AttendanceTableComponent implements OnInit {
  attendanceData: any[] = [];
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  isLoading = false;

  constructor(private attendanceService: AttendanceService) {}

  ngOnInit(): void {
    this.loadAttendanceHistory();
  }

  /**
   * Load attendance history with pagination
   */
  loadAttendanceHistory(): void {
    this.isLoading = true;

    const filters = {
      PageNumber: this.currentPage,
      PageSize: this.pageSize,
    };

    this.attendanceService.getAttendanceHistory(filters).subscribe({
      next: (response) => {
        if (response && response.succeeded && response.data) {
          this.attendanceData = (response.data.data || []).map((item: any) => ({
            ...item,
            clockIn: parseUtcToLocal(item.clockIn),
            clockOut: parseUtcToLocal(item.clockOut),
            duration: formatDuration(item.duration),
          }));
          this.totalCount = response.data.totalCount;
          this.totalPages = response.data.totalPages;
        } else {
          this.attendanceData = [];
          this.totalCount = 0;
          this.totalPages = 0;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading attendance history:', error);
        this.isLoading = false;
        this.attendanceData = [];
        this.totalCount = 0;
        this.totalPages = 0;
      },
    });
  }

  /**
   * Handle pagination change
   */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadAttendanceHistory();
  }

  /**
   * Format time values (Clock In/Out)
   */
  formatTime(timeString: string): string {
    if (!timeString) return '-';
    const time = new Date(timeString);
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Format date values
   */
  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  /**
   * Get CSS class for status display
   */
  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'status-present';
      case 'absent':
        return 'status-absent';
      case 'late':
        return 'status-late';
      case 'halfday':
        return 'status-halfday';
      default:
        return '';
    }
  }

  /**
   * Convert status string to display text
   */
  getStatusDisplay(status: string): string {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  /**
   * Calculate working hours from clock-in and clock-out
   */
  calculateHours(clockIn: string, clockOut: string): string {
    if (!clockIn || !clockOut) return '0';
    const start = new Date(clockIn);
    const end = new Date(clockOut);
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return diff.toFixed(1);
  }
}
