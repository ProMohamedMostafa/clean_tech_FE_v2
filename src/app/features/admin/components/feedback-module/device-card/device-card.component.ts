import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Device } from '../../../models/feedback/device.model';

@Component({
  selector: 'app-device-card',
  imports: [TranslateModule, CommonModule],
  templateUrl: './device-card.component.html',
  styleUrl: './device-card.component.scss',
})
export class DeviceCardComponent {
  @Input() device!: any;
  @Input() isAdmin: boolean = false;

  @Output() view = new EventEmitter<Device>();
  @Output() edit = new EventEmitter<Device>();
  @Output() delete = new EventEmitter<Device>();
  @Output() reload = new EventEmitter<Device>();
  @Output() toggleStatus = new EventEmitter<Device>();
  @Output() assign = new EventEmitter<Device>();

  onEdit() {
    this.edit.emit(this.device);
  }

  onDelete() {
    this.delete.emit(this.device);
  }

  onReload() {
    this.reload.emit(this.device);
  }

  onToggleStatus() {
    this.toggleStatus.emit(this.device);
  }

  onAssign() {
    this.assign.emit(this.device);
  }

  // 🔹 Utility functions used in template
  getDisplayValue(value: any, fallback: string = '--'): string {
    return value !== null && value !== undefined && value !== ''
      ? value
      : fallback;
  }

  getLastSeenHours(date: Date): number {
    if (!date) return 0;
    const now = new Date();
    const diff = (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60);
    return Math.floor(diff);
  }

  getBatteryColor(battery: number): string {
    if (!battery) return 'gray';
    if (battery > 70) return 'green';
    if (battery > 30) return 'orange';
    return 'red';
  }

  navigateToDetails() {
    this.view.emit(this.device);
    
  }

  openAssignModal() {
    this.assign.emit(this.device);
  }
}
