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
import { FloorService } from '../../../../services/work-location/floor.service';
import { UserService } from '../../../../services/user.service';
import { UserRole } from '../../../../../../core/models/roles.enum';
import {
  CreateEditFloorModel,
  Floor,
  FloorUsersShifts,
} from '../../../../models/work-location/floor.model';
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

interface Building {
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
  selector: 'app-floor-form',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    TranslateModule,
    PageTitleComponent,
  ],
  templateUrl: './floor-form.component.html',
  styleUrls: ['../../point-management/point-form/point-form.component.scss'],
})
export class FloorFormComponent implements OnInit {
  // Form state
  currentStep: number = 1;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  isEditMode: boolean = false;

  // Form data
  floorName: string = '';
  floorNumber: string = '';
  floorDescription: string = '';
  selectedCountry: string = '';
  selectedArea: Area | null = null;
  selectedCity: City | null = null;
  selectedOrganization: Organization | null = null;
  selectedBuilding: Building | null = null;
  selectedManagers: number[] = [];
  selectedSupervisors: number[] = [];
  selectedCleaners: number[] = [];
  selectedShifts: number[] = [];

  // Data lists
  countries: Country[] = [];
  areas: Area[] = [];
  cities: City[] = [];
  organizations: Organization[] = [];
  buildings: Building[] = [];
  managers: User[] = [];
  supervisors: User[] = [];
  cleaners: User[] = [];
  shifts: Shift[] = [];

  // Floor details for edit mode
  floorId: number | null = null;
  floorDetails: FloorUsersShifts | null = null;

  constructor(
    private readonly filterBarService: FilterBarService,
    private readonly floorService: FloorService,
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
        this.floorId = +params['id'];
        this.loadFloorDetails();
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

  private loadFloorDetails(): void {
    if (!this.floorId) return;

    this.isLoading = true;
    this.floorService.getFloorWithUserShift(this.floorId).subscribe({
      next: (floor) => {
        this.floorDetails = floor.data;
        this.populateFloorData();
      },
      error: (error) => {
        console.error('Error fetching floor details:', error);
        this.showErrorAlert(
          'Error',
          'An error occurred while loading floor details'
        );
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  private populateFloorData(): void {
    if (!this.floorDetails) return;

    // Populate basic floor data
    this.floorName = this.floorDetails.name;
    this.floorNumber = this.floorDetails.number;
    this.floorDescription = this.floorDetails.description;
    this.selectedCountry = this.floorDetails.countryName || '';

    // Initialize user arrays
    this.selectedManagers = [];
    this.selectedSupervisors = [];
    this.selectedCleaners = [];

    // Process users from the response
    if (this.floorDetails.users && this.floorDetails.users.length > 0) {
      this.floorDetails.users.forEach((user) => {
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
    if (this.floorDetails.shifts && this.floorDetails.shifts.length > 0) {
      this.selectedShifts = this.floorDetails.shifts.map((shift) => shift.id);
    }

    // Set the building if available
    if (this.floorDetails.buildingId) {
      this.selectedBuilding = {
        id: this.floorDetails.buildingId,
        name: this.floorDetails.buildingName || '',
      };
    }

    // Load dependent location data
    this.loadDependentData();
  }

  private async loadDependentData(): Promise<void> {
    if (!this.floorDetails) return;

    this.isLoading = true;

    try {
      // 1. Load areas for the country
      await this.loadAreasByCountry(this.floorDetails.countryName);

      // 2. Set selected area if areaId exists
      if (this.floorDetails.areaId) {
        this.selectedArea =
          this.areas.find((a) => a.id === this.floorDetails?.areaId) || null;

        // 3. Load cities for the selected area
        if (this.selectedArea) {
          await this.loadCitiesByArea(this.selectedArea.id);

          // 4. Set selected city if cityId exists
          if (this.floorDetails.cityId) {
            this.selectedCity =
              this.cities.find((c) => c.id === this.floorDetails?.cityId) ||
              null;

            // 5. Load organizations for the selected city
            if (this.selectedCity) {
              await this.loadOrganizationsByCity(this.selectedCity.id);

              // 6. Set selected organization if organizationId exists
              if (this.floorDetails.organizationId) {
                this.selectedOrganization =
                  this.organizations.find(
                    (o) => o.id === this.floorDetails?.organizationId
                  ) || null;

                // 7. Load buildings for the selected organization
                if (this.selectedOrganization) {
                  await this.loadBuildingsByOrganization(
                    this.selectedOrganization.id
                  );

                  // 8. Set selected building if buildingId exists
                  if (this.floorDetails.buildingId) {
                    this.selectedBuilding =
                      this.buildings.find(
                        (b) => b.id === this.floorDetails?.buildingId
                      ) || null;
                  }
                }
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

  private loadBuildingsByOrganization(organizationId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.filterBarService
        .loadBuildingsByOrganization(organizationId)
        .subscribe({
          next: (buildings) => {
            this.buildings = buildings || [];
            resolve();
          },
          error: (error) => {
            console.error('Error fetching buildings:', error);
            this.showErrorToast('Failed to load buildings');
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
        this.resetSelections(['area', 'city', 'organization', 'building']);
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
        this.resetSelections(['city', 'organization', 'building']);
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
        this.resetSelections(['organization', 'building']);
        this.currentStep = 4;
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  onOrganizationSelect(): void {
    if (!this.selectedOrganization) return;

    this.isLoading = true;
    this.loadBuildingsByOrganization(this.selectedOrganization.id)
      .then(() => {
        this.resetSelections(['building']);
        this.currentStep = 5;
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  private resetSelections(types: string[]): void {
    if (types.includes('area')) this.selectedArea = null;
    if (types.includes('city')) this.selectedCity = null;
    if (types.includes('organization')) this.selectedOrganization = null;
    if (types.includes('building')) this.selectedBuilding = null;
  }

  // Navigation methods
  nextStep(): void {
    if (this.currentStep < 7 ) {
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
      5: () =>
        this.validateSelection(
          this.selectedBuilding,
          'Please select a building'
        ),
      6: () => this.validateFloorDetails(),
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

  private validateFloorDetails(): boolean {
    const validations = [
      {
        field: this.floorName,
        message: 'Floor name must be at least 3 characters',
        minLength: 3,
      },
      {
        field: this.floorNumber,
        message: 'Floor number must be at least 3 characters',
        minLength: 3,
      },
      {
        field: this.floorDescription,
        message: 'Floor description must be at least 3 characters',
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
    if (!this.validateCurrentStep() || !this.selectedBuilding) return;

    const floorData: CreateEditFloorModel = {
      ...(this.isEditMode && this.floorId && { id: this.floorId }),
      name: this.floorName,
      number: this.floorNumber,
      description: this.floorDescription,
      buildingId: this.selectedBuilding.id,
      userIds: [
        ...this.selectedManagers,
        ...this.selectedSupervisors,
        ...this.selectedCleaners,
      ],
      shiftIds: this.selectedShifts,
    };

    this.isSubmitting = true;

    const operation = this.isEditMode
      ? this.floorService.updateFloor(floorData)
      : this.floorService.createFloor(floorData);

    operation.subscribe({
      next: () => {
        const message = this.isEditMode
          ? 'Floor updated successfully!'
          : 'Floor created successfully!';
        this.showSuccessAlert(message);
        this.resetForm();
        this.router.navigate(['admin', 'floor']);
      },
      error: (error) => {
        console.error(
          `Error ${this.isEditMode ? 'updating' : 'creating'} floor:`,
          error
        );
        const title = this.isEditMode
          ? 'Error updating floor'
          : 'Error creating floor';
        this.showErrorAlert(title, error.message || 'Please try again later.');
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }

  private resetForm(): void {
    this.floorName = '';
    this.floorNumber = '';
    this.floorDescription = '';
    this.selectedCountry = '';
    this.selectedArea = null;
    this.selectedCity = null;
    this.selectedOrganization = null;
    this.selectedBuilding = null;
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
      !!this.selectedOrganization &&
      !!this.selectedBuilding &&
      !!this.floorName
    );
  }

  get pageTitle(): string {
    return this.isEditMode
      ? 'FLOOR_EDIT.PAGE_TITLE'
      : 'FLOOR_CREATION.PAGE_TITLE';
  }

  get pageSubtitle(): string {
    return this.isEditMode
      ? 'FLOOR_EDIT.PAGE_SUBTITLE'
      : 'FLOOR_CREATION.PAGE_SUBTITLE';
  }

  get submitButtonText(): string {
    if (this.isSubmitting) {
      return this.isEditMode
        ? 'FLOOR_EDIT.DETAILS.UPDATING'
        : 'FLOOR_CREATION.DETAILS.CREATING';
    }
    return this.isEditMode
      ? 'FLOOR_EDIT.DETAILS.UPDATE_FLOOR'
      : 'FLOOR_CREATION.DETAILS.CREATE_FLOOR';
  }
}
