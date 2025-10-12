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
import { BuildingService } from '../../../../services/work-location/building.service';
import { UserService } from '../../../../services/user.service';
import { UserRole } from '../../../../../../core/models/roles.enum';
import {
  CreateEditBuildingModel,
  Building as BuildingModel,
  BuildingUsersShifts,
} from '../../../../models/work-location/building.model';
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

interface Organization {
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
  selector: 'app-building-form',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    TranslateModule,
    PageTitleComponent,
  ],
  templateUrl: './building-form.component.html',
  styleUrls: ['../../point-management/point-form/point-form.component.scss'],
})
export class BuildingFormComponent implements OnInit {
  // Form state
  currentStep: number = 1;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  isEditMode: boolean = false;

  // Form data
  buildingName: string = '';
  buildingNumber: string = '';
  buildingDescription: string = '';
  selectedCountry: string = '';
  selectedArea: Area | null = null;
  selectedCity: City | null = null;
  selectedOrganization: Organization | null = null;
  selectedManagers: number[] = [];
  selectedSupervisors: number[] = [];
  selectedCleaners: number[] = [];
  selectedShifts: number[] = [];

  // Data lists
  countries: Country[] = [];
  areas: Area[] = [];
  cities: City[] = [];
  organizations: Organization[] = [];
  managers: User[] = [];
  supervisors: User[] = [];
  cleaners: User[] = [];
  shifts: Shift[] = [];

  // Building details for edit mode
  buildingId: number | null = null;
  buildingDetails: BuildingUsersShifts | null = null;

  constructor(
    private readonly filterBarService: FilterBarService,
    private readonly buildingService: BuildingService,
    private readonly roleService: UserService,
    private readonly route: ActivatedRoute,
    private shiftService: ShiftService,
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
        this.buildingId = +params['id'];
        this.loadBuildingDetails();
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

  private loadBuildingDetails(): void {
    if (!this.buildingId) return;

    this.isLoading = true;
    this.buildingService.getBuildingWithUserShift(this.buildingId).subscribe({
      next: (building) => {
        this.buildingDetails = building.data;
        this.populateBuildingData();
      },
      error: (error) => {
        console.error('Error fetching building details:', error);
        this.showErrorAlert(
          'Error',
          'An error occurred while loading building details'
        );
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  private populateBuildingData(): void {
    if (!this.buildingDetails) return;

    // Populate basic building data
    this.buildingName = this.buildingDetails.name;
    this.buildingNumber = this.buildingDetails.number;
    this.buildingDescription = this.buildingDetails.description;
    this.selectedCountry = this.buildingDetails.countryName || '';

    // Initialize user arrays
    this.selectedManagers = [];
    this.selectedSupervisors = [];
    this.selectedCleaners = [];

    // Process users from the response
    if (this.buildingDetails.users && this.buildingDetails.users.length > 0) {
      this.buildingDetails.users.forEach((user) => {
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
    if (this.buildingDetails.shifts && this.buildingDetails.shifts.length > 0) {
      this.selectedShifts = this.buildingDetails.shifts.map(
        (shift) => shift.id
      );
    }

    // Set the organization if available
    if (this.buildingDetails.organizationId) {
      this.selectedOrganization = {
        id: this.buildingDetails.organizationId,
        name: this.buildingDetails.organizationName || '',
      };
    }

    // Load dependent location data
    this.loadDependentData();
  }

  private async loadDependentData(): Promise<void> {
    if (!this.buildingDetails) return;

    this.isLoading = true;

    try {
      // Load areas for the country
      await this.loadAreasByCountry(this.buildingDetails.countryName);

      // Set selected area if areaId exists
      if (this.buildingDetails.areaId) {
        this.selectedArea =
          this.areas.find((a) => a.id === this.buildingDetails?.areaId) || null;

        // Load cities for the selected area
        if (this.selectedArea) {
          await this.loadCitiesByArea(this.selectedArea.id);

          // Set selected city if cityId exists
          if (this.buildingDetails.cityId) {
            this.selectedCity =
              this.cities.find((c) => c.id === this.buildingDetails?.cityId) ||
              null;

            // Load organizations for the selected city
            if (this.selectedCity) {
              await this.loadOrganizationsByCity(this.selectedCity.id);

              // Set selected organization if organizationId exists
              if (this.buildingDetails.organizationId) {
                this.selectedOrganization =
                  this.organizations.find(
                    (o) => o.id === this.buildingDetails?.organizationId
                  ) || null;
              }
            }
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

  private loadOrganizationsByCity(cityId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.filterBarService.loadOrganizationsByCity(cityId).subscribe({
        next: (organizations) => {
          this.organizations = organizations || [];
          resolve();
        },
        error: (error) => {
          console.error('Error fetching organizations:', error);
          this.showErrorToast('Failed to load organizations');
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
        this.resetSelections(['area', 'city', 'organization']);
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
        this.resetSelections(['city', 'organization']);
        this.currentStep = 3;
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  onCitySelect(): void {
    if (!this.selectedCity) return;

    this.isLoading = true;
    this.loadOrganizationsByCity(this.selectedCity.id)
      .then(() => {
        this.resetSelections(['organization']);
        this.currentStep = 4;
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  private resetSelections(types: string[]): void {
    if (types.includes('area')) this.selectedArea = null;
    if (types.includes('city')) this.selectedCity = null;
    if (types.includes('organization')) this.selectedOrganization = null;
  }

  // Navigation methods
  nextStep(): void {
    if (this.currentStep < 6) {
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
      4: () =>
        this.validateSelection(
          this.selectedOrganization,
          'Please select an organization'
        ),
      5: () => this.validateBuildingDetails(),
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

  private validateBuildingDetails(): boolean {
    const validations = [
      {
        field: this.buildingName,
        message: 'Building name must be at least 3 characters',
        minLength: 3,
      },
      {
        field: this.buildingNumber,
        message: 'Building number must be at least 3 characters',
        minLength: 3,
      },
      {
        field: this.buildingDescription,
        message: 'Building description must be at least 3 characters',
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
    if (!this.validateCurrentStep() || !this.selectedOrganization) return;

    const buildingData: CreateEditBuildingModel = {
      ...(this.isEditMode && this.buildingId && { id: this.buildingId }),
      name: this.buildingName,
      number: this.buildingNumber,
      description: this.buildingDescription,
      organizationId: this.selectedOrganization.id,
      userIds: [
        ...this.selectedManagers,
        ...this.selectedSupervisors,
        ...this.selectedCleaners,
      ],
      shiftIds: this.selectedShifts,
    };

    this.isSubmitting = true;

    const operation = this.isEditMode
      ? this.buildingService.updateBuilding(buildingData)
      : this.buildingService.createBuilding(buildingData);

    operation.subscribe({
      next: () => {
        const message = this.isEditMode
          ? 'Building updated successfully!'
          : 'Building created successfully!';
        this.showSuccessAlert(message);
        this.resetForm();
        this.router.navigate(['admin', 'building']);
      },
      error: (error) => {
        console.error(
          `Error ${this.isEditMode ? 'updating' : 'creating'} building:`,
          error
        );
        const title = this.isEditMode
          ? 'Error updating building'
          : 'Error creating building';
        this.showErrorAlert(title, error.message || 'Please try again later.');
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }

  private resetForm(): void {
    this.buildingName = '';
    this.buildingNumber = '';
    this.buildingDescription = '';
    this.selectedCountry = '';
    this.selectedArea = null;
    this.selectedCity = null;
    this.selectedOrganization = null;
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
      !!this.selectedOrganization
    );
  }

  get pageTitle(): string {
    return this.isEditMode
      ? 'BUILDING_EDIT.PAGE_TITLE'
      : 'BUILDING_CREATION.PAGE_TITLE';
  }

  get pageSubtitle(): string {
    return this.isEditMode
      ? 'BUILDING_EDIT.PAGE_SUBTITLE'
      : 'BUILDING_CREATION.PAGE_SUBTITLE';
  }

  get submitButtonText(): string {
    if (this.isSubmitting) {
      return this.isEditMode
        ? 'BUILDING_EDIT.DETAILS.UPDATING'
        : 'BUILDING_CREATION.DETAILS.CREATING';
    }
    return this.isEditMode
      ? 'BUILDING_EDIT.DETAILS.UPDATE_BUILDING'
      : 'BUILDING_CREATION.DETAILS.CREATE_BUILDING';
  }
}
