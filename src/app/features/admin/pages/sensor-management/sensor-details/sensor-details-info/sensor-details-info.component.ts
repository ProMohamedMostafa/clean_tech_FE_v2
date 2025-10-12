// =======================================================
// Angular Imports
// =======================================================
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// =======================================================
// Models
// =======================================================
import { Device } from '../../../../models/sensor.model';

// =======================================================
// Component Declaration
// =======================================================
@Component({
  selector: 'app-sensor-details-info',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './sensor-details-info.component.html',
  styleUrls: ['./sensor-details-info.component.scss'],
})
export class SensorDetailsInfoComponent {
  // =======================================================
  // Input Properties
  // =======================================================
  @Input() device!: Device;
  @Input() selectedLimit: { key: string; min: number; max: number } | null = null;
  @Input() assignModal: any;

  // Parent-provided method references
  @Input() getHoursSinceLastSeen!: () => number;
  @Input() getValueByKey!: (key: string) => string;
  @Input() onSaveLimit!: () => void;
  @Input() deleteLimit!: () => void;
  @Input() deleteDevice!: (id: number) => void;
  @Input() handleAssignSuccess!: () => void;
  @Input() handleModalClose!: () => void;
  @Input() navigateToOrganization!: (id: number) => void;
  @Input() navigateToBuilding!: (id: number) => void;
  @Input() navigateToFloor!: (id: number) => void;
  @Input() navigateToSection!: (id: number) => void;
  @Input() navigateToPoint!: (id: number) => void;

  // =======================================================
  // Output Events
  // =======================================================
  @Output() selectedLimitChange = new EventEmitter<any>();
  @Output() optionSelected = new EventEmitter<any>();
  @Output() showAssignModal = new EventEmitter<void>();

  // =======================================================
  // Helper Methods
  // =======================================================

  /**
   * Convert UTC date string to local time (HH:mm)
   */
  getLocalTime(dateString: string): string {
    if (!dateString) return '';

    const utcDate = new Date(dateString);
    const localDate = new Date(
      utcDate.getTime() - utcDate.getTimezoneOffset() * 60000
    );

    const hours = localDate.getHours().toString().padStart(2, '0');
    const minutes = localDate.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
  }

  onMinChange(value: number) {
    this.selectedLimitChange.emit({ ...this.selectedLimit, min: value });
  }

  onMaxChange(value: number) {
    this.selectedLimitChange.emit({ ...this.selectedLimit, max: value });
  }

  onSelectOption(item: any) {
    this.optionSelected.emit(item);
  }
}
