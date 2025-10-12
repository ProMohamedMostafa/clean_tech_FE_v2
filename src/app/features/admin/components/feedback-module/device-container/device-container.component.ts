import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeviceCardComponent } from '../device-card/device-card.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-device-container',
  standalone: true,
  imports: [CommonModule, DeviceCardComponent, TranslateModule],
  templateUrl: './device-container.component.html',
  styleUrls: ['./device-container.component.scss'],
})
export class DeviceContainerComponent implements OnInit, OnChanges {
  @Output() contentTypeChanged = new EventEmitter<'devices' | 'audits'>();

  @Input() devices: any[] = [];

  @Input() currentPage: number = 1;
  @Input() totalPages: number = 2;
  @Input() totalCount: number = 16;
  @Input() pageSize: number = 8;

  @Output() pageChanged = new EventEmitter<number>();
  @Output() pageSizeChanged = new EventEmitter<number>();
  @Output() viewDevice = new EventEmitter<any>();
  @Output() editDevice = new EventEmitter<any>();
  @Output() deleteDevice = new EventEmitter<any>();
  @Output() reloadDevice = new EventEmitter<any>();
  @Output() toggleDeviceStatus = new EventEmitter<any>();
  @Output() assignDevice = new EventEmitter<any>();
  @Output() collapseAll = new EventEmitter<void>();
  @Output() expandAll = new EventEmitter<void>();

  collapsedDeviceIds: number[] = [];

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['devices']) {
      this.resetComponentState();
    }
  }

  private initializeComponent(): void {
    this.collapsedDeviceIds = this.devices.map((d) => d.id);
  }

  private resetComponentState(): void {
    this.collapsedDeviceIds = this.devices.map((d) => d.id);
  }

  isCollapsed(id: number): boolean {
    return this.collapsedDeviceIds.includes(id);
  }

  onCollapseAll(): void {
    this.collapsedDeviceIds = this.devices.map((d) => d.id);
    this.collapseAll.emit();
  }

  onExpandAll(): void {
    this.collapsedDeviceIds = [];
    this.expandAll.emit();
  }

  onViewDevice(device: any): void {
    this.viewDevice.emit(device);
  }

  onEditDevice(device: any): void {
    this.editDevice.emit(device);
  }

  onDeleteDevice(device: any): void {
    const deviceId = device.id;
    this.collapsedDeviceIds = this.collapsedDeviceIds.filter(
      (id) => id !== deviceId
    );
    this.deleteDevice.emit(device);
  }

  onReloadDevice(device: any): void {
    this.reloadDevice.emit(device);
  }

  onToggleDeviceStatus(device: any): void {
    this.toggleDeviceStatus.emit(device);
  }

  onAssignDevice(device: any): void {
    this.assignDevice.emit(device);
  }

  pageSizeOptions: number[] = [4, 8, 12, 16, 20, 24, 50, 100];

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
    if (page >= 1 && page <= this.totalPages) {
      this.pageChanged.emit(page);
    }
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newPageSize = parseInt(select.value, 10);

    if (newPageSize && newPageSize !== this.pageSize) {
      this.pageSizeChanged.emit(newPageSize);
    }
  }

  getItemRange(): { start: number; end: number } {
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.totalCount);
    return { start, end };
  }

  trackByDeviceId(index: number, device: any): number {
    return device.id;
  }

  onContentTypeChange(type: 'devices' | 'audits'): void {
    this.contentTypeChanged.emit(type);
  }
}
