// create-feedback-modal.component.ts
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
import { FeedbackDevice } from '../../../models/feedback/feedback-device.model';
import { DevicesService } from '../../../services/feedback/devices.service';
import { Device } from '../../../models/feedback/device.model';
@Component({
  selector: 'app-create-feedback-modal',
  templateUrl: './create-feedback-modal.component.html',
  styleUrls: ['./create-feedback-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
})
export class CreateFeedbackModalComponent implements OnInit, OnChanges {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() editData: any | null = null;

  @Output() modalClosed = new EventEmitter<void>();
  @Output() feedbackCreated = new EventEmitter<any>();
  @Output() feedbackUpdated = new EventEmitter<any>();

  devices: Device[] = [];
  selectedDevice: number | null = null;
  isLoadingDevices = false;

  // Form data
  feedback = {
    name: '',
    buildingId: null as number | null,
    floorId: null as number | null,
    sectionId: null as number | null,
    feedbackDeviceId: null as number | null, // ✅ added deviceId
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

    this.feedback.name = this.editData.name || '';
    this.selectedBuilding = this.editData.buildingId || null;
    this.selectedFloor = this.editData.floorId || null;
    this.selectedSection = this.editData.sectionId || null;
    this.selectedDevice = this.editData.feedbackDeviceId || null; // ✅ restore device

    if (this.selectedBuilding) {
      this.loadFloors(this.selectedBuilding, () => {
        if (this.selectedFloor) {
          this.loadSections(this.selectedFloor, () => {
            if (this.selectedSection) {
              this.loadDevices(this.selectedSection); // ✅ load devices
            }
          });
        }
      });
    }
  }

  private resetForm(): void {
    this.feedback = {
      name: '',
      buildingId: null,
      floorId: null,
      sectionId: null,
      feedbackDeviceId: null,
    };
    this.selectedBuilding = null;
    this.selectedFloor = null;
    this.selectedSection = null;
    this.buildings = [];
    this.floors = [];
    this.sections = [];
  }

  loadDevices(sectionId: number): void {
    this.isLoadingDevices = true;
    this.devicesService
      .getDevices({ SectionId: sectionId, PageNumber: 1, PageSize: 100 })
      .pipe(finalize(() => (this.isLoadingDevices = false)))
      .subscribe({
        next: (response) => {
          this.devices = response?.data?.data || [];
        },
        error: (err) => console.error('Error loading devices:', err),
      });
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
    this.feedback.buildingId = this.selectedBuilding;
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
    this.feedback.floorId = this.selectedFloor;
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

  onSectionChange(): void {
    this.feedback.sectionId = this.selectedSection;
    this.devices = [];
    this.selectedDevice = null;

    if (this.selectedSection) {
      this.loadDevices(this.selectedSection);
    }
  }

  isFormValid(): boolean {
    return (
      !!this.feedback.name && !!this.selectedSection && !!this.selectedDevice
    );
  }

  onSubmit(): void {
    this.feedback.sectionId = this.selectedSection;
    this.feedback.feedbackDeviceId = this.selectedDevice;
    if (this.mode === 'create') {
      this.feedbackCreated.emit(this.feedback);
    } else {
      this.feedbackUpdated.emit(this.feedback);
    }

    this.closeModal();
  }

  closeModal(): void {
    this.modalClosed.emit();
  }

  get modalTitle(): string {
    return this.mode === 'create'
      ? 'FEEDBACK_MODULE.CREATE_TITLE'
      : 'FEEDBACK_MODULE.EDIT_TITLE';
  }

  get submitButtonText(): string {
    return this.mode === 'create'
      ? 'FEEDBACK_MODULE.SUBMIT_CREATE'
      : 'FEEDBACK_MODULE.SUBMIT_UPDATE';
  }
}
