import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';

// Services
import { FilterBarService } from '../../../../../../shared/services/filter-bar.service';
import { AreaService } from '../../../../services/work-location/area.service';
import { UserService } from '../../../../services/user.service';
import { UserRole } from '../../../../../../core/models/roles.enum';
import {
  CreateEditAreaModel,
  Area as AreaModel,
  AreaUsers,
} from '../../../../models/work-location/area.model';
import { PageTitleComponent } from '../../../../../../shared/components/page-title/page-title.component';

// Models
interface Country {
  name: string;
}

interface User {
  id: number;
  userName: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  email?: string;
  image?: string | null;
}

interface Shift {
  id: number;
  name: string;
}

@Component({
  selector: 'app-area-form',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    TranslateModule,
    PageTitleComponent,
  ],
  templateUrl: './area-form.component.html',
  styleUrls: ['../../point-management/point-form/point-form.component.scss'],
})
export class AreaFormComponent implements OnInit {
  // Form state
  currentStep: number = 1;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  isEditMode: boolean = false;

  // Form data
  areaName: string = '';
  areaCode: string = '';
  areaDescription: string = '';
  selectedCountry: string = '';
  selectedManagers: number[] = [];
  selectedSupervisors: number[] = [];
  selectedCleaners: number[] = [];
  selectedShifts: number[] = [];

  // Data lists
  countries: Country[] = [];
  managers: User[] = [];
  supervisors: User[] = [];
  cleaners: User[] = [];
  shifts: Shift[] = [];

  // Area details for edit mode
  areaId: number | null = null;
  areaDetails: AreaUsers | null = null;

  constructor(
    private readonly filterBarService: FilterBarService,
    private readonly areaService: AreaService,
    private readonly roleService: UserService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
    this.checkEditMode();
  }

  private checkEditMode(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.areaId = +params['id'];
        // Don't load area details here, wait for initial data to load
      }
    });
  }

  private loadInitialData(): void {
    this.isLoading = true;

    Promise.all([this.loadCountries(), this.loadRoleUsers()])
      .then(() => {
        // After initial data is loaded, check if we're in edit mode
        if (this.isEditMode && this.areaId) {
          this.loadAreaDetails();
        } else {
          this.isLoading = false;
        }
      })
      .catch(() => {
        this.isLoading = false;
      });
  }

  private loadAreaDetails(): void {
    if (!this.areaId) return;

    this.isLoading = true;
    this.areaService.getAreaWithUser(this.areaId).subscribe({
      next: (area) => {
        this.areaDetails = area.data;
        this.populateAreaData();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching area details:', error);
        this.showErrorAlert(
          'Error',
          'An error occurred while loading area details'
        );
        this.isLoading = false;
      },
    });
  }

  private populateAreaData(): void {
    if (!this.areaDetails) return;

    // Populate basic area data
    this.areaName = this.areaDetails.name;

    // Find the exact country match from the countries list
    const matchedCountry = this.countries.find(
      (country) =>
        country.name.toLowerCase() ===
        this.areaDetails?.countryName?.toLowerCase()
    );

    // Set the selectedCountry to the exact value from countries list
    this.selectedCountry = matchedCountry ? matchedCountry.name : '';

    // Initialize user arrays
    this.selectedManagers = [];
    this.selectedSupervisors = [];
    this.selectedCleaners = [];

    // Process users from the response
    if (this.areaDetails.users) {
      this.areaDetails.users.forEach((user: any) => {
        if (user.role === 'Manager') {
          this.selectedManagers.push(user.id);
        } else if (user.role === 'Supervisor') {
          this.selectedSupervisors.push(user.id);
        } else if (user.role === 'Cleaner') {
          this.selectedCleaners.push(user.id);
        }
      });
    }
  }

  private loadCountries(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.filterBarService.loadNationalities().subscribe({
        next: (countries) => {
          this.countries = countries || [];
          resolve();
        },
        error: (error) => {
          console.error('Error fetching countries:', error);
          this.showErrorToast('Failed to load countries');
          reject(error);
        },
      });
    });
  }

  private loadRoleUsers(): Promise<void> {
    return Promise.all([
      this.loadUsersByRole(UserRole.Manager, 'managers'),
      this.loadUsersByRole(UserRole.Supervisor, 'supervisors'),
      this.loadUsersByRole(UserRole.Cleaner, 'cleaners'),
    ]).then(() => {});
  }

  private async loadUsersByRole(
    roleId: number,
    assignTo: 'managers' | 'supervisors' | 'cleaners'
  ): Promise<void> {
    try {
      const users = await this.roleService.getUsersByRole(roleId);
      this[assignTo] = users || [];
    } catch (error) {
      console.error(`Error fetching ${assignTo}:`, error);
      this.showErrorToast(`Failed to load ${assignTo}`);
      throw error;
    }
  }

  // Event handlers for dropdown selections
  onCountrySelect(): void {
    if (!this.selectedCountry) return;
    this.currentStep = 2;
  }

  // Navigation methods
  nextStep(): void {
    if (this.currentStep < 4 && this.validateCurrentStep()) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  private validateCurrentStep(): boolean {
    const validationMap: Record<number, () => boolean> = {
      1: () =>
        this.validateSelection(this.selectedCountry, 'Please select a country'),
      2: () => this.validateAreaDetails(),
    };

    const validator = validationMap[this.currentStep];
    return validator ? validator() : true;
  }

  private validateSelection(selection: any, errorMessage: string): boolean {
    if (!selection) {
      this.showErrorToast(errorMessage);
      return false;
    }
    return true;
  }

  private validateAreaDetails(): boolean {
    const validations = [
      {
        field: this.areaName,
        message: 'Area name must be at least 3 characters',
        minLength: 3,
      },
    ];

    for (const validation of validations) {
      if (!validation.field || validation.field.length < validation.minLength) {
        this.showErrorToast(validation.message);
        return false;
      }
    }
    return true;
  }

  // Form submission
  complete(): void {
    if (!this.validateCurrentStep()) return;

    const areaData: CreateEditAreaModel = {
      ...(this.isEditMode && this.areaId && { id: this.areaId }),
      name: this.areaName,
      countryName: this.selectedCountry,
      userIds: [
        ...this.selectedManagers,
        ...this.selectedSupervisors,
        ...this.selectedCleaners,
      ],
    };

    this.isSubmitting = true;

    const operation = this.isEditMode
      ? this.areaService.editArea(areaData)
      : this.areaService.createArea(areaData);

    operation.subscribe({
      next: () => {
        const message = this.isEditMode
          ? 'Area updated successfully!'
          : 'Area created successfully!';
        this.showSuccessAlert(message);
        this.resetForm();
        this.router.navigate(['admin', 'area']);
      },
      error: (error) => {
        console.error(
          `Error ${this.isEditMode ? 'updating' : 'creating'} area:`,
          error
        );
        const title = this.isEditMode
          ? 'Error updating area'
          : 'Error creating area';
        this.showErrorAlert(title, error.message || 'Please try again later.');
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }

  private resetForm(): void {
    this.areaName = '';
    this.areaCode = '';
    this.areaDescription = '';
    this.selectedCountry = '';
    this.selectedManagers = [];
    this.selectedSupervisors = [];
    this.selectedCleaners = [];
    this.selectedShifts = [];
    this.currentStep = 1;
  }

  // Alert methods
  private showSuccessAlert(title: string, text?: string): void {
    Swal.fire({
      title,
      text,
      icon: 'success',
      confirmButtonText: 'OK',
    });
  }

  private showErrorAlert(title: string, text?: string): void {
    Swal.fire({
      title,
      text,
      icon: 'error',
      confirmButtonText: 'OK',
    });
  }

  private showErrorToast(message: string): void {
    Swal.fire({
      title: 'Error',
      text: message,
      icon: 'error',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
    });
  }

  // Getters
  get isFormValid(): boolean {
    return (
      !!this.selectedCountry && !!this.areaName && this.areaName.length >= 3
    );
  }

  get pageTitle(): string {
    return this.isEditMode
      ? 'AREA_EDIT.PAGE_TITLE'
      : 'AREA_CREATION.PAGE_TITLE';
  }

  get pageSubtitle(): string {
    return this.isEditMode
      ? 'AREA_EDIT.PAGE_SUBTITLE'
      : 'AREA_CREATION.PAGE_SUBTITLE';
  }

  get submitButtonText(): string {
    if (this.isSubmitting) {
      return this.isEditMode
        ? 'AREA_EDIT.DETAILS.UPDATING'
        : 'AREA_CREATION.DETAILS.CREATING';
    }
    return this.isEditMode
      ? 'AREA_EDIT.DETAILS.UPDATE_AREA'
      : 'AREA_CREATION.DETAILS.CREATE_AREA';
  }
}
