// sensor-container.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SensorCardComponent } from '../sensor-card/sensor-card.component';

@Component({
  selector: 'app-sensor-container',
  standalone: true,
  imports: [CommonModule, SensorCardComponent],
  templateUrl: './sensor-container.component.html',
  styleUrls: ['./sensor-container.component.scss'],
})
export class SensorContainerComponent {
  @Input() devices: any[] = [];
  @Input() loading: boolean = false;
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() totalCount = 0;
  @Input() pageSize = 8;

  @Output() pageChange = new EventEmitter<number>();
  @Output() assignLocation = new EventEmitter<any>();
  @Output() editSensor = new EventEmitter<any>();
  @Output() reloadSensor = new EventEmitter<number>();
  @Output() toggleStatus = new EventEmitter<number>();
  @Output() viewDetails = new EventEmitter<number>();

  getPageNumbers(): number[] {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(
      1,
      this.currentPage - Math.floor(maxVisiblePages / 2)
    );
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > this.totalPages) {
      endPage = this.totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  onPageChange(page: number): void {
    if (page > 0 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }
  // Add this method to your component class for better *ngFor performance
  trackByDeviceId(index: number, device: any): any {
    return device.id || device.deviceId || index;
  }
}
