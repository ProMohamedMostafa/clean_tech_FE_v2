import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';
import { FilterBarService } from '../../../services/filter-bar.service';
import { SensorService } from '../../../../features/admin/services/sensor.service';
import { ToggleDevicePointPayload } from '../../../../features/admin/models/sensor.model';

@Component({
  selector: 'app-assign-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './assign-modal.component.html',
  styleUrls: ['./assign-modal.component.scss'],
})
export class AssignModalComponent {
  // Inputs from parent component
  @Input() sensorId!: number;
  @Input() pointId: number | null = null;
  @Input() organizationId: number | null = null;
  @Input() buildingId: number | null = null;
  @Input() floorId: number | null = null;
  @Input() sectionId: number | null = null;

  @Input() sensorName: string = '';
  @Input() sensorDescription: string = '';

  // trigger after success
  @Output() saveSuccess = new EventEmitter<void>();
  // Add this to your existing outputs in assign-modal.component.ts
  @Output() closeModal = new EventEmitter<void>();

  // Dropdown data arrays
  organizations: any[] = [];
  buildings: any[] = [];
  floors: any[] = [];
  sections: any[] = [];
  points: any[] = [];

  // Selected values for each dropdown
  selectedOrganization: number | null = null;
  selectedBuilding: number | null = null;
  selectedFloor: number | null = null;
  selectedsection: number | null = null;
  selectedPoint: number | null = null;

  // Stepper control
  currentStep: number = 1;

  constructor(
    private filterService: FilterBarService,
    private sensorService: SensorService
  ) {}

  /**
   * Handle changes from parent and pre-populate the dropdowns in order
   */
  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    console.log('Input changes detected:', changes);

    if (
      changes['organizationId'] ||
      changes['buildingId'] ||
      changes['floorId'] ||
      changes['sectionId'] ||
      changes['pointId']
    ) {
      this.selectedOrganization = this.organizationId;
      this.loadOrganizations(1);

      if (this.organizationId) {
        await this.onOrganizationChange(); // Load buildings first
        this.selectedBuilding = this.buildingId;

        if (this.buildingId) {
          await this.onBuildingChange(); // Then floors
          this.selectedFloor = this.floorId;

          if (this.floorId) {
            await this.onFloorChange(); // Then sections
            this.selectedsection = this.sectionId;

            if (this.sectionId) {
              await this.onSectionChange(); // Then points
              this.selectedPoint = this.pointId;
            }
          }
        }
      }
    }
  }

  // 🔄 Load all organizations (for first step)
  loadOrganizations(page: number): void {
    this.filterService.loadOrganizationsPaged(page).subscribe((data) => {
      this.organizations = data;
    });
  }

  // 🔄 On organization change => load buildings and reset lower levels
  onOrganizationChange(): Promise<void> {
    const orgId = this.selectedOrganization;

    if (orgId != null) {
      return new Promise((resolve) => {
        this.filterService
          .loadBuildingsByOrganization(orgId)
          .subscribe((data) => {
            this.buildings = data;

            // Reset lower levels
            this.selectedBuilding = null;
            this.selectedFloor = null;
            this.selectedsection = null;
            this.selectedPoint = null;

            this.floors = [];
            this.sections = [];
            this.points = [];

            resolve();
          });
      });
    }

    return Promise.resolve();
  }

  // 🔄 On building change => load floors and reset below
  onBuildingChange(): Promise<void> {
    const buildId = this.selectedBuilding;

    if (buildId != null) {
      return new Promise((resolve) => {
        this.filterService.loadFloorsByBuilding(buildId).subscribe((data) => {
          this.floors = data;

          // Reset lower levels
          this.selectedFloor = null;
          this.selectedsection = null;
          this.selectedPoint = null;

          this.sections = [];
          this.points = [];

          resolve();
        });
      });
    }

    return Promise.resolve();
  }

  // 🔄 On floor change => load sections and reset below
  onFloorChange(): Promise<void> {
    const floorId = this.selectedFloor;

    if (floorId != null) {
      return new Promise((resolve) => {
        this.filterService.loadSectionsByFloor(floorId).subscribe((data) => {
          this.sections = data;

          // Reset lower levels
          this.selectedsection = null;
          this.selectedPoint = null;
          this.points = [];

          resolve();
        });
      });
    }

    return Promise.resolve();
  }

  // 🔄 On section change => load points
  onSectionChange(): Promise<void> {
    const secId = this.selectedsection;

    if (secId != null) {
      return new Promise((resolve) => {
        this.filterService.loadPointsBySection(secId).subscribe((data) => {
          this.points = data;

          // Reset point selection
          this.selectedPoint = null;

          resolve();
        });
      });
    }

    return Promise.resolve();
  }

  // ⬅️ Stepper: go to previous step
  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // ➡️ Stepper: go to next step
  nextStep(): void {
    if (this.currentStep < 5) {
      this.currentStep++;
    }
  }

  /**
   * 🧭 Set specific step if allowed (prevents skipping required selections)
   */
  setStep(step: number): void {
    if (
      (step === 2 && !this.selectedOrganization) ||
      (step === 3 && !this.selectedBuilding) ||
      (step === 4 && !this.selectedFloor) ||
      (step === 5 && !this.selectedsection)
    ) {
      return;
    }

    this.currentStep = step;
  }

  /**
   * ✅ Trigger saving changes after final step or manual save
   */
  saveChanges(): void {
    if (
      this.sensorName ||
      this.sensorDescription ||
      this.selectedPoint !== null
    ) {
      this.saveBasicInfo();
    }
  }

  /**
   * 📡 Send updated sensor info to API
   */
  saveBasicInfo(): void {
    const payload: ToggleDevicePointPayload = {
      id: this.sensorId,
      deviceId: this.sensorId, // Assuming sensorId is the same as deviceId
      isActive: true, // Set appropriate value based on your logic
      customName: this.sensorName,
      customDescription: this.sensorDescription,
      pointId: this.selectedPoint,
    };

    // Loading popup
    Swal.fire({
      title: 'Saving Changes',
      text: 'Please wait while we update the sensor information...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    // API call to save - error handling removed as it's handled by global interceptor
    this.sensorService.toggleDevicePoint(payload).subscribe(() => {
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Sensor information updated successfully',
        timer: 2000,
        showConfirmButton: false,
      });
      // ✅ Emit event to notify parent
      this.saveSuccess.emit();
    });
  }

  sendWithNoPoint(): void {
    const payload: ToggleDevicePointPayload = {
      id: this.sensorId,
      deviceId: this.sensorId, // Assuming sensorId is the same as deviceId
      isActive: true, // Set appropriate value based on your logic
      customName: this.sensorName,
      customDescription: this.sensorDescription,
      pointId: null, // explicitly set pointId to null
    };

    Swal.fire({
      title: 'Sending Without Point',
      text: 'Please wait while we send the data without point...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    // API call - error handling removed as it's handled by global interceptor
    this.sensorService.toggleDevicePoint(payload).subscribe(() => {
      Swal.fire({
        icon: 'success',
        title: 'Sent!',
        text: 'Sensor info sent successfully without point',
        timer: 2000,
        showConfirmButton: false,
      });
      this.saveSuccess.emit();
    });
  }

  /**
   * 🔄 Reset all selections and return to first step
   */
  resetFilters(): void {
    this.selectedOrganization = null;
    this.selectedBuilding = null;
    this.selectedFloor = null;
    this.selectedsection = null;
    this.selectedPoint = null;

    this.buildings = [];
    this.floors = [];
    this.sections = [];
    this.points = [];

    this.currentStep = 1;
  }
}
