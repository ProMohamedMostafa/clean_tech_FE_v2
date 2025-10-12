// Angular Core Modules
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Angular Material Modules
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

// Third-party Modules
import { TranslateModule } from '@ngx-translate/core';
import Swal from 'sweetalert2';

// Models
import {
  DropdownItem,
  HierarchyLevel,
  Shift,
  ShiftCreateOrEditRequest,
} from '../../../models/shift.model';

// Services
import { ShiftService } from '../../../services/shift.service';
import { FilterBarService } from '../../../../../shared/services/filter-bar.service';

/**
 * ShiftFormComponent - Handles creation and editing of shift entries
 */
@Component({
  selector: 'app-shift-form',
  templateUrl: './shift-form.component.html',
  styleUrls: ['./shift-form.component.scss'],
  standalone: true,
  imports: [FormsModule, MatSelectModule, MatFormFieldModule, TranslateModule],
})
export class ShiftFormComponent implements OnInit {
  // ======================
  // Component Properties
  // ======================

  // Mode and ID
  isEditMode: boolean = false;
  shiftId: number | null = null;

  // Form Data
  shiftData = {
    id: null as number | null,
    name: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
  };

  // UI State
  loading: boolean = false;
  dateError: boolean = false;

  // Hierarchy Configuration
  levels: HierarchyLevel[] = [
    HierarchyLevel.ORGANIZATION,
    HierarchyLevel.BUILDING,
    HierarchyLevel.FLOOR,
    HierarchyLevel.SECTION,
  ];
  selectedLevel: HierarchyLevel | null = null;

  // Dropdown Data
  organizations: DropdownItem[] = [];
  buildings: DropdownItem[] = [];
  floors: DropdownItem[] = [];
  sections: DropdownItem[] = [];

  // Selected Values
  selectedOrganization: number | null = null;
  selectedBuilding: number | null = null;
  selectedFloor: number | null = null;
  selectedSection: number | null = null;

  // ======================
  // Constructor
  // ======================
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private shiftService: ShiftService,
    private filterBarService: FilterBarService
  ) {}

  // ======================
  // Lifecycle Hooks
  // ======================
  ngOnInit(): void {
    this.initializeComponent();
  }

  // ======================
  // Initialization Methods
  // ======================

  /**
   * Initialize component based on route parameters
   */
  private initializeComponent(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.shiftId = parseInt(id, 10);
        this.loadShiftDetails(this.shiftId);
      } else {
        this.isEditMode = false;
        this.loadOrganizations();
      }
    });
  }

  /**
   * Load shift details for editing
   * @param id - The ID of the shift to edit
   */
  private loadShiftDetails(id: number): void {
    this.loading = true;
    this.shiftService.getShiftDetailsById(id).subscribe({
      next: (response) => {
        if (response?.data) {
          this.loadOrganizations();
          this.populateFormData(response.data);
          this.determineSelectedLevel(response.data);
        } else {
          this.handleLoadError('Failed to load shift details');
        }
        this.loading = false;
      },
      error: (err) => this.handleLoadError('Error loading shift details', err),
    });
  }

  /**
   * Populate form with existing shift data
   */
  private populateFormData(data: Shift): void {
    console.log('🔹 API Shift Data Received:', data);

    this.shiftData = {
      id: data.id,
      name: data.name,
      startDate: this.formatDate(data.startDate),
      endDate: this.formatDate(data.endDate),
      startTime: data.startTime,
      endTime: data.endTime,
    };

    console.log('📌 Populated Shift Form Data:', this.shiftData);

    // Set dropdown selections if available
    if (data.organizations?.length) {
      this.selectedOrganization = data.organizations[0].id;
      console.log('✅ Selected Organization ID:', this.selectedOrganization);
    }

    if (data.building?.length) {
      this.selectedBuilding = data.building[0].id;
      console.log('✅ Selected Building ID:', this.selectedBuilding);
    }

    if (data.floors?.length) {
      this.selectedFloor = data.floors[0].id;
      console.log('✅ Selected Floor ID:', this.selectedFloor);
    }

    if (data.sections?.length) {
      this.selectedSection = data.sections[0].id;
      console.log('✅ Selected Section ID:', this.selectedSection);
    }
  }

  // ======================
  // Hierarchy Methods
  // ======================

  /**
   * Determine and set selected level hierarchy
   */
  private determineSelectedLevel(data: Shift): void {
    if (data.sections?.length) {
      this.selectedLevel = HierarchyLevel.SECTION;
    } else if (data.floors?.length) {
      this.selectedLevel = HierarchyLevel.FLOOR;
    } else if (data.building?.length) {
      this.selectedLevel = HierarchyLevel.BUILDING;
    } else if (data.organizations?.length) {
      this.selectedLevel = HierarchyLevel.ORGANIZATION;
    }
  }

  // ======================
  // Dropdown Data Loading
  // ======================

  /**
   * Load organizations for dropdown
   */
  private loadOrganizations(): void {
    this.filterBarService.loadOrganizationsPaged().subscribe({
      next: (organizations) => {
        this.organizations = organizations;

        // Cascade loading for edit mode
        if (this.isEditMode && this.selectedOrganization) {
          this.onOrganizationChange(); // -> loads buildings
        }
      },
      error: (err) => this.handleDropdownError('organizations', err),
    });
  }

  /**
   * Load buildings for selected organization
   * @param organizationId - The selected organization ID
   */
  private loadBuildingsByOrganization(organizationId: number): void {
    this.filterBarService
      .loadBuildingsByOrganization(organizationId)
      .subscribe({
        next: (buildings) => {
          this.buildings = buildings;
          if (this.isEditMode && this.selectedBuilding) {
            this.onBuildingChange();
          }
        },
        error: (err) => this.handleDropdownError('buildings', err),
      });
  }

  /**
   * Load floors for selected building
   * @param buildingId - The selected building ID
   */
  private loadFloorsByBuilding(buildingId: number): void {
    this.filterBarService.loadFloorsByBuilding(buildingId).subscribe({
      next: (floors) => {
        this.floors = floors;
        if (this.isEditMode && this.selectedFloor) {
          this.onFloorChange();
        }
      },
      error: (err) => this.handleDropdownError('floors', err),
    });
  }

  /**
   * Load sections for selected floor
   * @param floorId - The selected floor ID
   */
  private loadSectionsByFloor(floorId: number): void {
    this.filterBarService.loadSectionsByFloor(floorId).subscribe({
      next: (sections) => {
        this.sections = sections;
      },
      error: (err) => this.handleDropdownError('sections', err),
    });
  }

  // ======================
  // Event Handlers
  // ======================

  /**
   * Handle hierarchy level change
   */
  onLevelChange(): void {
    this.loadOrganizations();
    this.resetLowerLevelSelections();
  }

  /**
   * Handle organization selection change
   */
  onOrganizationChange(): void {
    if (this.selectedOrganization) {
      this.loadBuildingsByOrganization(this.selectedOrganization);
      if (!this.isEditMode) {
        this.resetBuildingSelection();
      }
    }
  }

  /**
   * Handle building selection change
   */
  onBuildingChange(): void {
    if (this.selectedBuilding) {
      this.loadFloorsByBuilding(this.selectedBuilding);
      if (!this.isEditMode) {
        this.resetFloorSelection();
      }
    }
  }

  /**
   * Handle floor selection change
   */
  onFloorChange(): void {
    if (this.selectedFloor) {
      this.loadSectionsByFloor(this.selectedFloor);
      if (!this.isEditMode) {
        this.resetSectionSelection();
      }
    }
  }

  /**
   * Validate that end date is not before start date
   */
  validateDates(): void {
    if (this.shiftData.startDate && this.shiftData.endDate) {
      const start = new Date(this.shiftData.startDate);
      const end = new Date(this.shiftData.endDate);
      this.dateError = end < start;
    } else {
      this.dateError = false;
    }
  }

  // ======================
  // Form Submission
  // ======================

  /**
   * Submit the form (create or update)
   */
  submitShift(): void {
    if (this.dateError) {
      this.showErrorAlert('End date cannot be before start date');
      return;
    }

    if (!this.isFormValid()) {
      this.showErrorAlert('Please fill all required fields.');
      return;
    }

    this.loading = true;
    const payload = this.buildShiftPayload();

    const operation = this.isEditMode
      ? this.shiftService.updateShift(payload)
      : this.shiftService.createShift(payload);

    operation.subscribe({
      next: (success) =>
        success ? this.handleSuccess() : this.handleError('Operation failed'),
      error: (err) => this.handleError(err),
    });
  }

  /**
   * Check if form is valid
   */
  private isFormValid(): boolean {
    return !!(
      this.shiftData.name &&
      this.shiftData.startDate &&
      this.shiftData.endDate &&
      this.shiftData.startTime &&
      this.shiftData.endTime
    );
  }

  /**
   * Build the shift payload for API request
   */
  private buildShiftPayload(): ShiftCreateOrEditRequest {
    const payload: ShiftCreateOrEditRequest = {
      name: this.shiftData.name,
      startDate: this.shiftData.startDate,
      endDate: this.shiftData.endDate,
      startTime: this.shiftData.startTime,
      endTime: this.shiftData.endTime,
      organizationIds: [],
      buildingIds: [],
      floorIds: [],
      sectionIds: [],
    };

    if (this.isEditMode && this.shiftId) {
      payload.id = this.shiftId;
    }

    this.setHierarchyLevelIds(payload);
    return payload;
  }

  /**
   * Set hierarchy level IDs based on all selected values
   * @param payload - The payload to modify
   */
  private setHierarchyLevelIds(payload: ShiftCreateOrEditRequest): void {
    // Always send the full chain if available
    if (this.selectedOrganization) {
      payload.organizationIds = [this.selectedOrganization];
      console.log('📌 Added organizationId:', this.selectedOrganization);
    }
    if (this.selectedBuilding) {
      payload.buildingIds = [this.selectedBuilding];
      console.log('📌 Added buildingId:', this.selectedBuilding);
    }
    if (this.selectedFloor) {
      payload.floorIds = [this.selectedFloor];
      console.log('📌 Added floorId:', this.selectedFloor);
    }
    if (this.selectedSection) {
      payload.sectionIds = [this.selectedSection];
      console.log('📌 Added sectionId:', this.selectedSection);
    }
  }

  // ======================
  // Helper Methods
  // ======================

  /**
   * Format date string for input field
   * @param dateString - The date string to format
   */
  private formatDate(dateString: string): string {
    return dateString ? new Date(dateString).toISOString().split('T')[0] : '';
  }

  /**
   * Reset selections below the current level
   */
  private resetLowerLevelSelections(): void {
    if (!this.selectedLevel) return;

    switch (this.selectedLevel) {
      case HierarchyLevel.ORGANIZATION:
        this.resetBuildingSelection();
        this.resetFloorSelection();
        this.resetSectionSelection();
        break;
      case HierarchyLevel.BUILDING:
        this.resetFloorSelection();
        this.resetSectionSelection();
        break;
      case HierarchyLevel.FLOOR:
        this.resetSectionSelection();
        break;
    }
  }

  // ======================
  // UI Methods
  // ======================

  /**
   * Handle successful operation
   */
  private handleSuccess(): void {
    this.loading = false;
    const message = this.isEditMode
      ? 'Shift updated successfully!'
      : 'Shift created successfully!';

    Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      confirmButtonText: 'OK',
    }).then(() => {
      this.resetForm();
      this.router.navigate(['admin/shift']);
    });
  }

  /**
   * Reset the form to initial state
   */
  resetForm(): void {
    this.shiftData = {
      id: null,
      name: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
    };
    this.selectedLevel = null;
    this.selectedOrganization = null;
    this.selectedBuilding = null;
    this.selectedFloor = null;
    this.selectedSection = null;
    this.buildings = [];
    this.floors = [];
    this.sections = [];
    this.dateError = false;
  }

  // ======================
  // Error Handling
  // ======================

  /**
   * Handle load error
   * @param message - Error message
   * @param error - Original error object
   */
  private handleLoadError(message: string, error?: any): void {
    console.error('Error:', message, error);
    this.showErrorAlert(message);
    this.loading = false;
    this.router.navigate(['admin/shift']);
  }

  /**
   * Handle dropdown loading error
   * @param type - Type of dropdown
   * @param error - Error object
   */
  private handleDropdownError(type: string, error: any): void {
    console.error(`Error loading ${type}:`, error);
    this.showErrorAlert(`Failed to load ${type}`);
  }

  /**
   * Handle form submission error
   * @param error - Error object or message
   */
  private handleError(error: any): void {
    this.loading = false;
    console.error('Shift operation error:', error);
    const message = this.isEditMode
      ? 'Error updating shift. Please try again.'
      : 'Error creating shift. Please try again.';
    this.showErrorAlert(message);
  }

  /**
   * Show error alert
   * @param message - Error message to display
   */
  private showErrorAlert(message: string): void {
    Swal.fire({
      title: 'Error!',
      text: message,
      icon: 'error',
      confirmButtonText: 'OK',
    });
  }

  // ======================
  // Selection Reset Methods
  // ======================

  private resetBuildingSelection(): void {
    this.selectedBuilding = null;
    this.buildings = [];
  }

  private resetFloorSelection(): void {
    this.selectedFloor = null;
    this.floors = [];
  }

  private resetSectionSelection(): void {
    this.selectedSection = null;
    this.sections = [];
  }

  // ======================
  // Template Getters
  // ======================

  get pageTitle(): string {
    return this.isEditMode ? 'Edit Shift' : 'Add Shift';
  }
}
