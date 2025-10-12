// =======================================================
// Angular Imports
// =======================================================
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

// =======================================================
// Custom Imports
// =======================================================
import { TruncatePipe } from './pipes/truncate.pipe';

// =======================================================
// Component Declaration
// =======================================================
@Component({
  selector: 'app-sensor-card',
  standalone: true,
  imports: [CommonModule, TranslateModule, TruncatePipe],
  templateUrl: './sensor-card.component.html',
  styleUrls: ['./sensor-card.component.scss'],
})
export class SensorCardComponent {
  // =======================================================
  // Input Properties
  // =======================================================
  @Input() device: any; // Single device input
  @Input() devices: any[] = []; // List of devices (backward compatibility)
  @Input() loading: boolean = false; // Loading state
  @Input() paginationInfo: any; // Pagination information

  // =======================================================
  // Output Events
  // =======================================================
  @Output() pageChange = new EventEmitter<number>();
  @Output() filterApplied = new EventEmitter<any>();
  @Output() reloadSensor = new EventEmitter<number>();
  @Output() toggleStatus = new EventEmitter<number>();
  @Output() viewDetails = new EventEmitter<number>();
  @Output() assignLocation = new EventEmitter<any>(); // Emit device assignment info

  // =======================================================
  // Local Properties
  // =======================================================
  Math = Math; // Allow using Math in template
  showAllData: { [deviceId: number]: boolean } = {}; // Toggle showing all device data

  // =======================================================
  // Constructor
  // =======================================================
  constructor(private router: Router) {}

  // =======================================================
  // Date & Time Utilities
  // =======================================================
  /**
   * Convert UTC date string to local time (HH:mm)
   */
  getLocalLastSeen(dateString: string): string {
    if (!dateString) return '';

    const utcDate = new Date(dateString);
    const localDate = new Date(
      utcDate.getTime() - utcDate.getTimezoneOffset() * 60000
    );

    const hours = localDate.getHours().toString().padStart(2, '0');
    const minutes = localDate.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
  }

  /**
   * Format date in medium format
   */
  getFormattedDate(dateString: string): string {
    return dateString ? formatDate(dateString, 'medium', 'en-US') : '';
  }

  // =======================================================
  // Device Utilities
  // =======================================================
  /**
   * Get battery color based on battery percentage
   */
  getBatteryColor(battery: number): string {
    if (battery > 70) return '#3DB64A';
    if (battery > 30) return '#FFC107';
    return '#F44336';
  }

  /**
   * Get data to display (truncate if needed)
   */
  getDisplayedData(device: any): { key: string; value: string }[] {
    if (this.showAllData[device.id] || device.data.length <= 2) {
      return device.data;
    }
    return device.data.slice(0, 2);
  }

  /**
   * Toggle showing all data for a device
   */
  toggleShowAll(deviceId: number): void {
    this.showAllData[deviceId] = !this.showAllData[deviceId];
  }

  // =======================================================
  // Pagination Methods
  // =======================================================
  /**
   * Generate page numbers array for pagination
   */
  getPageNumbers(): number[] {
    if (!this.paginationInfo) return [];

    const pages: number[] = [];
    const totalPages = this.paginationInfo.totalPages;
    const currentPage = this.paginationInfo.currentPage;

    pages.push(1);
    const start = Math.max(2, currentPage - 2);
    const end = Math.min(totalPages - 1, currentPage + 2);

    if (start > 2) pages.push(-1); // Ellipsis
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push(-1); // Ellipsis
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  }

  /**
   * Handle page change event
   */
  onPageChange(page: number) {
    if (
      page > 0 &&
      page <= this.paginationInfo.totalPages &&
      page !== this.paginationInfo.currentPage
    ) {
      this.pageChange.emit(page);
    }
  }

  // =======================================================
  // Device Actions
  // =======================================================
  /**
   * Open Assign Location modal and emit data
   */
  openAssignModal(
    deviceId: number,
    deviceName: string,
    deviceDescription: string,
    organizationId: number,
    buildingId: number,
    floorId: number,
    sectionId: number,
    pointId: number
  ) {
    const deviceData = {
      id: deviceId,
      name: deviceName,
      description: deviceDescription,
      organizationId,
      buildingId,
      floorId,
      sectionId,
      pointId,
    };

    this.assignLocation.emit(deviceData);
  }

  /**
   * Emit filter applied event
   */
  onFilterApplied(filterValues: any) {
    this.filterApplied.emit(filterValues || {});
  }

  /**
   * Navigate to sensor details page
   */
  navigateToDetails(deviceId: number): void {
    this.router.navigate(['admin', 'sensor-details', deviceId]);
  }

  /**
   * Refresh sensor list after updates
   */
  onSensorUpdated(): void {
    this.filterApplied.emit({});
    this.pageChange.emit(this.paginationInfo?.currentPage);
  }

  /**
   * Emit reload sensor event
   */
  onReload(deviceId: number) {
    this.reloadSensor.emit(deviceId);
  }

  /**
   * Emit toggle status event
   */
  onToggleStatus(deviceId: number) {
    this.toggleStatus.emit(deviceId);
  }

  /**
   * Emit view details event
   */
  onViewDetails(deviceId: number) {
    this.viewDetails.emit(deviceId);
  }
}
