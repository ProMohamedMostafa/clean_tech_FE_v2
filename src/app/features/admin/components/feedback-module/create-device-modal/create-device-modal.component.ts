import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { FilterBarService } from '../../../../../shared/services/filter-bar.service';
import { Device } from '../../../models/feedback/device.model';
import { DevicesService } from '../../../services/feedback/devices.service';

@Component({
  selector: 'app-create-device-modal',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './create-device-modal.component.html',
  styleUrl: './create-device-modal.component.scss',
})
export class CreateDeviceModalComponent implements OnInit, OnChanges {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() editData: any | null = null;

  @Output() modalClosed = new EventEmitter<void>();
  @Output() deviceCreated = new EventEmitter<{
    name: string;
    sectionId: number;
  }>();
  @Output() deviceUpdated = new EventEmitter<{
    name: string;
    sectionId: number;
  }>();

  // Form data
  device = {
    name: '',
    buildingId: null as number | null,
    floorId: null as number | null,
    sectionId: null as number | null,
  };

  // Location hierarchy
  buildings: any[] = [];
  floors: any[] = [];
  sections: any[] = [];

  // Selected values
  selectedBuilding: number | null = null;
  selectedFloor: number | null = null;
  selectedSection: number | null = null;

  // Loading states
  isLoadingBuildings = false;
  isLoadingFloors = false;
  isLoadingSections = false;
  isSubmitting = false;

  constructor(
    private filterBarService: FilterBarService,
    private devicesService: DevicesService
  ) {}

  ngOnInit(): void {
    this.loadBuildings();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editData'] && this.editData && this.mode === 'edit') {
      this.populateEditData();
    } else if (changes['mode'] && this.mode === 'create') {
      this.resetForm();
    }
  }

  private populateEditData(): void {
    if (!this.editData) return;

    this.device.name = this.editData.name || '';
    this.selectedSection = this.editData.sectionId || null;
    this.selectedBuilding = this.editData.buildingId || null;
    this.selectedFloor = this.editData.floorId || null;

    if (this.selectedBuilding) {
      this.loadFloors(this.selectedBuilding, () => {
        if (this.selectedFloor) {
          this.loadSections(this.selectedFloor);
        }
      });
    }
  }

  private resetForm(): void {
    this.device = {
      name: '',
      buildingId: null,
      floorId: null,
      sectionId: null,
    };
    this.selectedBuilding = null;
    this.selectedFloor = null;
    this.selectedSection = null;
    this.floors = [];
    this.sections = [];
  }

  loadBuildings(): void {
    this.isLoadingBuildings = true;
    this.filterBarService
      .loadBuildingsPaged(1, 1000)
      .pipe(finalize(() => (this.isLoadingBuildings = false)))
      .subscribe({
        next: (buildings) => {
          this.buildings = buildings;
          // If in edit mode and we have edit data, populate after buildings load
          if (this.mode === 'edit' && this.editData) {
            this.populateEditData();
          }
        },
        error: (err) => console.error('Error loading buildings:', err),
      });
  }

  onBuildingChange(): void {
    this.device.buildingId = this.selectedBuilding;
    this.selectedFloor = null;
    this.selectedSection = null;
    this.floors = [];
    this.sections = [];

    if (this.selectedBuilding) {
      this.loadFloors(this.selectedBuilding);
    }
  }

  loadFloors(buildingId: number, callback?: () => void): void {
    this.isLoadingFloors = true;
    this.filterBarService
      .loadFloorsByBuilding(buildingId)
      .pipe(finalize(() => (this.isLoadingFloors = false)))
      .subscribe({
        next: (floors) => {
          this.floors = floors;
          if (callback) callback();
        },
        error: (err) => console.error('Error loading floors:', err),
      });
  }

  onFloorChange(): void {
    this.device.floorId = this.selectedFloor;
    this.selectedSection = null;
    this.sections = [];

    if (this.selectedFloor) {
      this.loadSections(this.selectedFloor);
    }
  }

  loadSections(floorId: number, callback?: () => void): void {
    this.isLoadingSections = true;
    this.filterBarService
      .loadSectionsByFloor(floorId)
      .pipe(finalize(() => (this.isLoadingSections = false)))
      .subscribe({
        next: (sections) => {
          this.sections = sections;
          if (callback) callback();
        },
        error: (err) => console.error('Error loading sections:', err),
      });
  }

  isFormValid(): boolean {
    return !!this.device.name && !!this.selectedSection;
  }

  onSubmit(): void {
    if (!this.isFormValid() || this.isSubmitting) return;

    this.device.sectionId = this.selectedSection;

    const deviceData = {
      name: this.device.name,
      sectionId: this.device.sectionId!,
    };

    if (this.mode === 'create') {
      this.deviceCreated.emit(deviceData);
    } else {
      this.deviceUpdated.emit(deviceData);
    }

    this.closeModal();
  }

  closeModal(): void {
    this.modalClosed.emit();
  }

  get modalTitle(): string {
    return this.mode === 'create'
      ? 'Create'
      : 'FEEDBACK_MODULE.EDIT_TITLE';
  }

  get submitButtonText(): string {
    return this.mode === 'create'
      ? 'FEEDBACK_MODULE.SUBMIT_CREATE'
      : 'FEEDBACK_MODULE.SUBMIT_UPDATE';
  }
}
