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
import { CityService } from '../../../../services/work-location/city.service';
import { UserService } from '../../../../services/user.service';
import { UserRole } from '../../../../../../core/models/roles.enum';
import {
  CreateEditCityModel,
  City as CityModel,
  CityUsers,
} from '../../../../models/work-location/city.model';
import { PageTitleComponent } from '../../../../../../shared/components/page-title/page-title.component';

// Models
interface Country {
  name: string;
}

interface Area {
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
  selector: 'app-city-form',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    TranslateModule,
    PageTitleComponent,
  ],
  templateUrl: './city-form.component.html',
  styleUrls: ['../../point-management/point-form/point-form.component.scss'],
})
export class CityFormComponent implements OnInit {
  // Form state
  currentStep: number = 1;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  isEditMode: boolean = false;

  // Form data
  cityName: string = '';
  selectedCountry: string = '';
  selectedArea: Area | null = null;
  selectedManagers: number[] = [];
  selectedSupervisors: number[] = [];
  selectedCleaners: number[] = [];
  selectedShifts: number[] = [];

  // Data lists
  countries: Country[] = [];
  areas: Area[] = [];
  managers: User[] = [];
  supervisors: User[] = [];
  cleaners: User[] = [];
  shifts: Shift[] = [];

  // City details for edit mode
  cityId: number | null = null;
  cityDetails: CityUsers | null = null;

  constructor(
    private readonly filterBarService: FilterBarService,
    private readonly cityService: CityService,
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
        this.cityId = +params['id'];
        this.loadCityDetails();
      }
    });
  }

  private loadInitialData(): void {
    this.isLoading = true;

    Promise.all([
      this.loadCountries(),
      this.loadRoleUsers(),
      // this.loadShifts(), // Uncomment when shifts are needed
    ]).finally(() => {
      this.isLoading = false;
    });
  }

  private loadCityDetails(): void {
    if (!this.cityId) return;

    this.isLoading = true;
    this.cityService.getCityWithUser(this.cityId).subscribe({
      next: (city) => {
        this.cityDetails = city;
        this.populateCityData();
      },
      error: (error) => {
        console.error('Error fetching city details:', error);
        this.showErrorAlert(
          'Error',
          'An error occurred while loading city details'
        );
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  private populateCityData(): void {
    if (!this.cityDetails) return;

    // Populate basic city data
    this.cityName = this.cityDetails.name;
    this.selectedCountry = this.cityDetails.countryName || '';

    // Initialize user arrays
    this.selectedManagers = [];
    this.selectedSupervisors = [];
    this.selectedCleaners = [];

    // Process users from the response
    if (this.cityDetails.users && this.cityDetails.users.length > 0) {
      this.cityDetails.users.forEach((user: any) => {
        if (user.role === 'Manager') {
          this.selectedManagers.push(user.id);
        } else if (user.role === 'Supervisor') {
          this.selectedSupervisors.push(user.id);
        } else if (user.role === 'Cleaner') {
          this.selectedCleaners.push(user.id);
        }
      });
    }

    // Load dependent location data
    this.loadDependentData();
  }

  private loadDependentData(): void {
    if (!this.cityDetails) return;

    this.isLoading = true;

    this.loadAreasByCountry(this.cityDetails.countryName)
      .then(() => {
        if (this.cityDetails?.areaId) {
          this.selectedArea =
            this.areas.find((a) => a.id === this.cityDetails?.areaId) || null;
        }
      })
      .finally(() => {
        this.isLoading = false;
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

  // Event handlers for dropdown selections
  onCountrySelect(): void {
    if (!this.selectedCountry) return;

    this.isLoading = true;
    this.loadAreasByCountry(this.selectedCountry)
      .then(() => {
        this.resetSelections(['area']);
        this.currentStep = 2;
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  private resetSelections(types: string[]): void {
    if (types.includes('area')) this.selectedArea = null;
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
      2: () =>
        this.validateSelection(this.selectedArea, 'Please select an area'),
      3: () => this.validateCityDetails(),
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

  private validateCityDetails(): boolean {
    const validations = [
      {
        field: this.cityName,
        message: 'City name must be at least 3 characters',
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
    if (!this.validateCurrentStep() || !this.selectedArea) return;

    const cityData: CreateEditCityModel = {
      ...(this.isEditMode && this.cityId && { id: this.cityId }),
      name: this.cityName,
      areaId: this.selectedArea.id,
      userIds: [
        ...this.selectedManagers,
        ...this.selectedSupervisors,
        ...this.selectedCleaners,
      ],
    };

    this.isSubmitting = true;

    const operation = this.isEditMode
      ? this.cityService.updateCity(cityData)
      : this.cityService.createCity(cityData);

    operation.subscribe({
      next: () => {
        const message = this.isEditMode
          ? 'City updated successfully!'
          : 'City created successfully!';
        this.showSuccessAlert(message);
        this.resetForm();
        this.router.navigate(['admin', 'city']);
      },
      error: (error) => {
        console.error(
          `Error ${this.isEditMode ? 'updating' : 'creating'} city:`,
          error
        );
        const title = this.isEditMode
          ? 'Error updating city'
          : 'Error creating city';
        this.showErrorAlert(title, error.message || 'Please try again later.');
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }

  private resetForm(): void {
    this.cityName = '';
    this.selectedCountry = '';
    this.selectedArea = null;
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
      !!this.cityName &&
      this.cityName.length >= 3
    );
  }

  get pageTitle(): string {
    return this.isEditMode
      ? 'CITY_EDIT.PAGE_TITLE'
      : 'CITY_CREATION.PAGE_TITLE';
  }

  get pageSubtitle(): string {
    return this.isEditMode
      ? 'CITY_EDIT.PAGE_SUBTITLE'
      : 'CITY_CREATION.PAGE_SUBTITLE';
  }

  get submitButtonText(): string {
    if (this.isSubmitting) {
      return this.isEditMode
        ? 'CITY_EDIT.DETAILS.UPDATING'
        : 'CITY_CREATION.DETAILS.CREATING';
    }
    return this.isEditMode
      ? 'CITY_EDIT.DETAILS.UPDATE_CITY'
      : 'CITY_CREATION.DETAILS.CREATE_CITY';
  }
}
