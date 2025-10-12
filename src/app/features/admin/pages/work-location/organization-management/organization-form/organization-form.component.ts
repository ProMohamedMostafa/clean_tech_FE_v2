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
import { OrganizationService } from '../../../../services/work-location/organization.service';
import { UserService } from '../../../../services/user.service';
import { UserRole } from '../../../../../../core/models/roles.enum';
import {
  CreateEditOrganizationModel,
  Organization as OrganizationModel,
  OrganizationUsersShifts,
} from '../../../../models/work-location/organization.model';
import { PageTitleComponent } from '../../../../../../shared/components/page-title/page-title.component';
import { ShiftService } from '../../../../services/shift.service';

// Models
interface Country {
  name: string;
}

interface Area {
  id: number;
  name: string;
}

interface City {
  id: number;
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
  selector: 'app-organization-form',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    TranslateModule,
    PageTitleComponent,
  ],
  templateUrl: './organization-form.component.html',
  styleUrls: ['../../point-management/point-form/point-form.component.scss'],
})
export class OrganizationFormComponent implements OnInit {
  // Form state
  currentStep: number = 1;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  isEditMode: boolean = false;

  // Form data
  organizationName: string = '';
  selectedCountry: string = '';
  selectedArea: Area | null = null;
  selectedCity: City | null = null;
  selectedManagers: number[] = [];
  selectedSupervisors: number[] = [];
  selectedCleaners: number[] = [];
  selectedShifts: number[] = [];

  // Data lists
  countries: Country[] = [];
  areas: Area[] = [];
  cities: City[] = [];
  managers: User[] = [];
  supervisors: User[] = [];
  cleaners: User[] = [];
  shifts: Shift[] = [];

  // Organization details for edit mode
  organizationId: number | null = null;
  organizationDetails: OrganizationUsersShifts | null = null;

  constructor(
    private readonly filterBarService: FilterBarService,
    private readonly organizationService: OrganizationService,
    private readonly roleService: UserService,
    private shiftService: ShiftService,
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
        this.organizationId = +params['id'];
        this.loadOrganizationDetails();
      }
    });
  }

  private loadInitialData(): void {
    this.isLoading = true;

    Promise.all([
      this.loadCountries(),
      this.loadRoleUsers(),
      this.loadShifts(), // Uncomment when shifts are needed
    ]).finally(() => {
      this.isLoading = false;
    });
  }

  private loadOrganizationDetails(): void {
    if (!this.organizationId) return;

    this.isLoading = true;
    this.organizationService
      .getOrganizationWithUserShift(this.organizationId)
      .subscribe({
        next: (organization) => {
          this.organizationDetails = organization;
          this.populateOrganizationData();
        },
        error: (error) => {
          console.error('Error fetching organization details:', error);
          this.showErrorAlert(
            'Error',
            'An error occurred while loading organization details'
          );
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  private populateOrganizationData(): void {
    if (!this.organizationDetails) return;
    // Load dependent location data
    this.loadDependentData();
    // Populate basic organization data
    this.organizationName = this.organizationDetails.name;
    this.selectedCountry = this.organizationDetails.countryName || '';

    // Initialize user arrays
    this.selectedManagers = [];
    this.selectedSupervisors = [];
    this.selectedCleaners = [];

    // Process users from the response
    if (
      this.organizationDetails.users &&
      this.organizationDetails.users.length > 0
    ) {
      this.organizationDetails.users.forEach((user) => {
        if (user.role === 'Manager') {
          this.selectedManagers.push(user.id);
        } else if (user.role === 'Supervisor') {
          this.selectedSupervisors.push(user.id);
        } else if (user.role === 'Cleaner') {
          this.selectedCleaners.push(user.id);
        }
      });
    }

    // Process shifts from the response
    if (
      this.organizationDetails.shifts &&
      this.organizationDetails.shifts.length > 0
    ) {
      this.selectedShifts = this.organizationDetails.shifts.map(
        (shift) => shift.id
      );
    }
  }

  private async loadDependentData(): Promise<void> {
    if (!this.organizationDetails) return;

    this.isLoading = true;

    try {
      // Load areas for the country
      await this.loadAreasByCountry(this.organizationDetails.countryName);

      // Set selected area if areaId exists
      if (this.organizationDetails.areaId) {
        this.selectedArea =
          this.areas.find((a) => a.id === this.organizationDetails?.areaId) ||
          null;

        // Load cities for the selected area
        if (this.selectedArea) {
          await this.loadCitiesByArea(this.selectedArea.id);

          // Set selected city if cityId exists
          if (this.organizationDetails.cityId) {
            this.selectedCity =
              this.cities.find(
                (c) => c.id === this.organizationDetails?.cityId
              ) || null;
          }
        }
      }
    } catch (error) {
      console.error('Error loading dependent data:', error);
      this.showErrorToast('Failed to load location data');
    } finally {
      this.isLoading = false;
    }
  }

  private loadShifts(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.shiftService
        .getPaginatedShifts({
          pageNumber: 1,
          pageSize: 100, // You can adjust this or make it null to get all shifts
        })
        .subscribe({
          next: (response) => {
            if (response && response.succeeded) {
              // The response structure likely has a 'data' property that contains the paginated results
              // Adjust this based on your actual API response structure
              this.shifts = response.data?.data || response.data || [];
            } else {
              console.error('Failed to fetch shifts:', response?.message);
            }
            resolve();
          },
          error: (error) => {
            console.error('Error fetching shifts:', error);
            this.showErrorToast('Failed to load shifts');
            reject(error);
          },
        });
    });
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

  private loadAreasByCountry(countryName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.filterBarService.loadAreasByCountry(countryName).subscribe({
        next: (areas) => {
          this.areas = areas || [];
          resolve();
        },
        error: (error) => {
          console.error('Error fetching areas:', error);
          this.showErrorToast('Failed to load areas');
          reject(error);
        },
      });
    });
  }

  private loadCitiesByArea(areaId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.filterBarService.loadCitiesByArea(areaId).subscribe({
        next: (cities) => {
          this.cities = cities || [];
          resolve();
        },
        error: (error) => {
          console.error('Error fetching cities:', error);
          this.showErrorToast('Failed to load cities');
          reject(error);
        },
      });
    });
  }

  // Event handlers for dropdown selections
  onCountrySelect(): void {
    if (!this.selectedCountry) return;

    this.isLoading = true;
    this.loadAreasByCountry(this.selectedCountry)
      .then(() => {
        this.resetSelections(['area', 'city']);
        this.currentStep = 2;
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  onAreaSelect(): void {
    if (!this.selectedArea) return;

    this.isLoading = true;
    this.loadCitiesByArea(this.selectedArea.id)
      .then(() => {
        this.resetSelections(['city']);
        this.currentStep = 3;
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  onCitySelect(): void {
    if (!this.selectedCity) return;
    this.currentStep = 4;
  }

  private resetSelections(types: string[]): void {
    if (types.includes('area')) this.selectedArea = null;
    if (types.includes('city')) this.selectedCity = null;
  }

  // Navigation methods
  nextStep(): void {
    if (this.currentStep < 5 && this.validateCurrentStep()) {
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
      2: () =>
        this.validateSelection(this.selectedArea, 'Please select an area'),
      3: () =>
        this.validateSelection(this.selectedCity, 'Please select a city'),
      4: () => this.validateOrganizationDetails(),
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

  private validateOrganizationDetails(): boolean {
    const validations = [
      {
        field: this.organizationName,
        message: 'Organization name must be at least 3 characters',
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
    if (!this.validateCurrentStep() || !this.selectedCity) return;

    const organizationData: CreateEditOrganizationModel = {
      ...(this.isEditMode &&
        this.organizationId && { id: this.organizationId }),
      name: this.organizationName,
      cityId: this.selectedCity.id,
      userIds: [
        ...this.selectedManagers,
        ...this.selectedSupervisors,
        ...this.selectedCleaners,
      ],
      shiftIds: this.selectedShifts,
    };

    this.isSubmitting = true;

    const operation = this.isEditMode
      ? this.organizationService.updateOrganization(organizationData)
      : this.organizationService.createOrganization(organizationData);

    operation.subscribe({
      next: () => {
        const message = this.isEditMode
          ? 'Organization updated successfully!'
          : 'Organization created successfully!';
        this.showSuccessAlert(message);
        this.resetForm();
        this.router.navigate(['admin', 'organization']);
      },
      error: (error) => {
        console.error(
          `Error ${this.isEditMode ? 'updating' : 'creating'} organization:`,
          error
        );
        const title = this.isEditMode
          ? 'Error updating organization'
          : 'Error creating organization';
        this.showErrorAlert(title, error.message || 'Please try again later.');
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }

  private resetForm(): void {
    this.organizationName = '';
    this.selectedCountry = '';
    this.selectedArea = null;
    this.selectedCity = null;
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
      !!this.selectedCountry &&
      !!this.selectedArea &&
      !!this.selectedCity &&
      !!this.organizationName &&
      this.organizationName.length >= 3
    );
  }

  get pageTitle(): string {
    return this.isEditMode
      ? 'ORGANIZATION_EDIT.PAGE_TITLE'
      : 'ORGANIZATION_CREATION.PAGE_TITLE';
  }

  get pageSubtitle(): string {
    return this.isEditMode
      ? 'ORGANIZATION_EDIT.PAGE_SUBTITLE'
      : 'ORGANIZATION_CREATION.PAGE_SUBTITLE';
  }

  get submitButtonText(): string {
    if (this.isSubmitting) {
      return this.isEditMode
        ? 'ORGANIZATION_EDIT.DETAILS.UPDATING'
        : 'ORGANIZATION_CREATION.DETAILS.CREATING';
    }
    return this.isEditMode
      ? 'ORGANIZATION_EDIT.DETAILS.UPDATE_ORGANIZATION'
      : 'ORGANIZATION_CREATION.DETAILS.CREATE_ORGANIZATION';
  }
}
