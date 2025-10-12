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
import { SectionService } from '../../../../services/work-location/section.service';
import { UserService } from '../../../../services/user.service';
import { UserRole } from '../../../../../../core/models/roles.enum';
import {
  CreateEditSectionModel,
  Section,
  SectionUsersShifts,
} from '../../../../models/work-location/section.model';
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

interface Floor {
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
  selector: 'app-section-form',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    TranslateModule,
    PageTitleComponent,
  ],
  templateUrl: './section-form.component.html',
  styleUrls: ['../../point-management/point-form/point-form.component.scss'],
})
export class SectionFormComponent implements OnInit {
  // Form state
  currentStep: number = 1;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  isEditMode: boolean = false;

  // Form data
  sectionName: string = '';
  sectionNumber: string = '';
  sectionDescription: string = '';
  selectedCountry: string = '';
  selectedArea: Area | null = null;
  selectedCity: City | null = null;
  selectedOrganization: Organization | null = null;
  selectedBuilding: Building | null = null;
  selectedFloor: Floor | null = null;
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
  floors: Floor[] = [];
  managers: User[] = [];
  supervisors: User[] = [];
  cleaners: User[] = [];
  shifts: Shift[] = [];

  // Section details for edit mode
  sectionId: number | null = null;
  sectionDetails: SectionUsersShifts | null = null;

  constructor(
    private readonly filterBarService: FilterBarService,
    private readonly sectionService: SectionService,
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
        this.sectionId = +params['id'];
        this.loadSectionDetails();
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

  private loadSectionDetails(): void {
    if (!this.sectionId) return;

    this.isLoading = true;
    this.sectionService.getSectionWithUserShift(this.sectionId).subscribe({
      next: (section) => {
        this.sectionDetails = section.data;
        this.populateSectionData();
      },
      error: (error) => {
        console.error('Error fetching section details:', error);
        this.showErrorAlert(
          'Error',
          'An error occurred while loading section details'
        );
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  private populateSectionData(): void {
    if (!this.sectionDetails) return;

    // Populate basic section data
    this.sectionName = this.sectionDetails.name;
    this.sectionNumber = this.sectionDetails.number;
    this.sectionDescription = this.sectionDetails.description;
    this.selectedCountry = this.sectionDetails.countryName || '';

    // Initialize user arrays
    this.selectedManagers = [];
    this.selectedSupervisors = [];
    this.selectedCleaners = [];

    // Process users from the response
    if (this.sectionDetails.users && this.sectionDetails.users.length > 0) {
      this.sectionDetails.users.forEach((user) => {
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
    if (this.sectionDetails.shifts && this.sectionDetails.shifts.length > 0) {
      this.selectedShifts = this.sectionDetails.shifts.map((shift) => shift.id);
    }

    // Set the floor if available
    if (this.sectionDetails.floorId) {
      this.selectedFloor = {
        id: this.sectionDetails.floorId,
        name: this.sectionDetails.floorName || '',
      };
    }

    // Load dependent location data
    this.loadDependentData();
  }

  private async loadDependentData(): Promise<void> {
    if (!this.sectionDetails) return;

    this.isLoading = true;

    try {
      // 1. Load areas for the country
      await this.loadAreasByCountry(this.sectionDetails.countryName);

      // 2. Set selected area if areaId exists
      if (this.sectionDetails.areaId) {
        this.selectedArea =
          this.areas.find((a) => a.id === this.sectionDetails?.areaId) || null;

        // 3. Load cities for the selected area
        if (this.selectedArea) {
          await this.loadCitiesByArea(this.selectedArea.id);

          // 4. Set selected city if cityId exists
          if (this.sectionDetails.cityId) {
            this.selectedCity =
              this.cities.find((c) => c.id === this.sectionDetails?.cityId) ||
              null;

            // 5. Load organizations for the selected city
            if (this.selectedCity) {
              await this.loadOrganizationsByCity(this.selectedCity.id);

              // 6. Set selected organization if organizationId exists
              if (this.sectionDetails.organizationId) {
                this.selectedOrganization =
                  this.organizations.find(
                    (o) => o.id === this.sectionDetails?.organizationId
                  ) || null;

                // 7. Load buildings for the selected organization
                if (this.selectedOrganization) {
                  await this.loadBuildingsByOrganization(
                    this.selectedOrganization.id
                  );

                  // 8. Set selected building if buildingId exists
                  if (this.sectionDetails.buildingId) {
                    this.selectedBuilding =
                      this.buildings.find(
                        (b) => b.id === this.sectionDetails?.buildingId
                      ) || null;

                    // 9. Load floors for the selected building
                    if (this.selectedBuilding) {
                      await this.loadFloorsByBuilding(this.selectedBuilding.id);

                      // 10. Set selected floor if floorId exists
                      if (this.sectionDetails.floorId) {
                        this.selectedFloor =
                          this.floors.find(
                            (f) => f.id === this.sectionDetails?.floorId
                          ) || null;
                      }
                    }
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

  private loadFloorsByBuilding(buildingId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.filterBarService.loadFloorsByBuilding(buildingId).subscribe({
        next: (floors) => {
          this.floors = floors || [];
          resolve();
        },
        error: (error) => {
          console.error('Error fetching floors:', error);
          this.showErrorToast('Failed to load floors');
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
        this.resetSelections([
          'area',
          'city',
          'organization',
          'building',
          'floor',
        ]);
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
        this.resetSelections(['city', 'organization', 'building', 'floor']);
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
        this.resetSelections(['organization', 'building', 'floor']);
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
        this.resetSelections(['building', 'floor']);
        this.currentStep = 5;
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  onBuildingSelect(): void {
    if (!this.selectedBuilding) return;

    this.isLoading = true;
    this.loadFloorsByBuilding(this.selectedBuilding.id)
      .then(() => {
        this.resetSelections(['floor']);
        this.currentStep = 6;
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
    if (types.includes('floor')) this.selectedFloor = null;
  }

  // Navigation methods
  nextStep(): void {
    if (this.currentStep < 8) {
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
      6: () =>
        this.validateSelection(this.selectedFloor, 'Please select a floor'),
      7: () => this.validateSectionDetails(),
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

  private validateSectionDetails(): boolean {
    const validations = [
      {
        field: this.sectionName,
        message: 'Section name must be at least 3 characters',
        minLength: 3,
      },
      {
        field: this.sectionNumber,
        message: 'Section number must be at least 3 characters',
        minLength: 3,
      },
      {
        field: this.sectionDescription,
        message: 'Section description must be at least 3 characters',
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
    if (!this.validateCurrentStep() || !this.selectedFloor) return;

    const sectionData: CreateEditSectionModel = {
      ...(this.isEditMode && this.sectionId && { id: this.sectionId }),
      name: this.sectionName,
      number: this.sectionNumber,
      description: this.sectionDescription,
      floorId: this.selectedFloor.id,
      userIds: [
        ...this.selectedManagers,
        ...this.selectedSupervisors,
        ...this.selectedCleaners,
      ],
      shiftIds: this.selectedShifts,
    };

    this.isSubmitting = true;

    const operation = this.isEditMode
      ? this.sectionService.updateSection(sectionData)
      : this.sectionService.createSection(sectionData);

    operation.subscribe({
      next: () => {
        const message = this.isEditMode
          ? 'Section updated successfully!'
          : 'Section created successfully!';
        this.showSuccessAlert(message);
        this.resetForm();
        this.router.navigate(['admin', 'section']);
      },
      error: (error) => {
        console.error(
          `Error ${this.isEditMode ? 'updating' : 'creating'} section:`,
          error
        );
        const title = this.isEditMode
          ? 'Error updating section'
          : 'Error creating section';
        this.showErrorAlert(title, error.message || 'Please try again later.');
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }

  private resetForm(): void {
    this.sectionName = '';
    this.sectionNumber = '';
    this.sectionDescription = '';
    this.selectedCountry = '';
    this.selectedArea = null;
    this.selectedCity = null;
    this.selectedOrganization = null;
    this.selectedBuilding = null;
    this.selectedFloor = null;
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
      !!this.selectedFloor &&
      !!this.sectionName &&
      this.sectionName.length >= 3
    );
  }

  get pageTitle(): string {
    return this.isEditMode
      ? 'SECTION_EDIT.PAGE_TITLE'
      : 'SECTION_CREATION.PAGE_TITLE';
  }

  get pageSubtitle(): string {
    return this.isEditMode
      ? 'SECTION_EDIT.PAGE_SUBTITLE'
      : 'SECTION_CREATION.PAGE_SUBTITLE';
  }

  get submitButtonText(): string {
    if (this.isSubmitting) {
      return this.isEditMode
        ? 'SECTION_EDIT.DETAILS.UPDATING'
        : 'SECTION_CREATION.DETAILS.CREATING';
    }
    return this.isEditMode
      ? 'SECTION_EDIT.DETAILS.UPDATE_SECTION'
      : 'SECTION_CREATION.DETAILS.CREATE_SECTION';
  }
}
