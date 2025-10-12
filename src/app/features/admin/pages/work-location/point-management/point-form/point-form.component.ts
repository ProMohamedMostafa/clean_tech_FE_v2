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
import { PointService } from '../../../../services/work-location/point.service';
import { UserService } from '../../../../services/user.service';
import { UserRole } from '../../../../../../core/models/roles.enum';
import {
  CreateEditPointModel,
  Point,
  PointUsers,
} from '../../../../models/work-location/point.model';
import { PageTitleComponent } from '../../../../../../shared/components/page-title/page-title.component';
import { Device } from '../../../../models/sensor.model';
import { SensorService } from '../../../../services/sensor.service';

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

interface Section {
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
  selector: 'app-point-form',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    TranslateModule,
    PageTitleComponent,
  ],
  templateUrl: './point-form.component.html',
  styleUrls: ['./point-form.component.scss'],
})
export class PointFormComponent implements OnInit {
  // Form state
  currentStep: number = 1;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  isEditMode: boolean = false;

  // Form data
  pointName: string = '';
  pointNumber: string = '';
  pointDescription: string = '';
  selectedCountry: string = '';
  selectedArea: Area | null = null;
  selectedCity: City | null = null;
  selectedOrganization: Organization | null = null;
  selectedBuilding: Building | null = null;
  selectedFloor: Floor | null = null;
  selectedSection: Section | null = null;
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
  sections: Section[] = [];
  managers: User[] = [];
  supervisors: User[] = [];
  cleaners: User[] = [];
  shifts: Shift[] = [];

  // Point details for edit mode
  pointId: number | null = null;
  pointDetails: PointUsers | null = null;
  selectedSensor?: number;
  sensors: Device[] = [];
  constructor(
    private readonly filterBarService: FilterBarService,
    private readonly pointService: PointService,
    private readonly roleService: UserService,
    private sensorService: SensorService,
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
        this.pointId = +params['id'];
        this.loadPointDetails();
      }
    });
  }

  private loadInitialData(): void {
    this.isLoading = true;

    Promise.all([
      this.loadCountries(),
      this.loadRoleUsers(),
      this.loadSensors(),
    ]).finally(() => {
      this.isLoading = false;
    });
  }

  private loadPointDetails(): void {
    if (!this.pointId) return;

    this.isLoading = true;
    this.pointService.getPointWithUser(this.pointId).subscribe({
      next: (point) => {
        this.pointDetails = point.data;
        this.populatePointData();
      },
      error: (error) => {
        console.error('Error fetching point details:', error);
        this.showErrorAlert(
          'Error',
          'An error occurred while loading point details'
        );
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  private loadSensors(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.sensorService
        .getDevices(
          1, // pageNumber
          null, // pageSize (null to get all)
          '', // searchQuery
          undefined, // applicationId
          undefined, // areaId
          undefined, // cityId
          undefined, // organizationId
          undefined, // buildingId
          undefined, // floorId
          undefined, // sectionId
          undefined, // pointId
          true, // isActive (only active devices)
          undefined, // minBattery
          undefined, // maxBattery
          null // isAssign
        )
        .subscribe({
          next: (response) => {
            if (response?.succeeded && response.data) {
              this.sensors = response.data.data;
            }
            resolve();
          },
          error: (error) => {
            console.error('Error loading sensors:', error);
            resolve(); // Still resolve to continue loading other data
          },
        });
    });
  }

  private populatePointData(): void {
    if (!this.pointDetails) return;

    // Populate basic point data
    this.pointName = this.pointDetails.name;
    this.pointNumber = this.pointDetails.number;
    this.pointDescription = this.pointDetails.description;
    this.selectedCountry = this.pointDetails.countryName || '';

    // Initialize user arrays
    this.selectedManagers = [];
    this.selectedSupervisors = [];
    this.selectedCleaners = [];

    // Set the selected sensor from the response
    this.selectedSensor = this.pointDetails.deviceId || undefined;

    // Process users from the response
    if (this.pointDetails.users && this.pointDetails.users.length > 0) {
      this.pointDetails.users.forEach((user) => {
        if (user.role === 'Manager') {
          this.selectedManagers.push(user.id);
        } else if (user.role === 'Supervisor') {
          this.selectedSupervisors.push(user.id);
        } else if (user.role === 'Cleaner') {
          this.selectedCleaners.push(user.id);
        }
      });
    }

    // Set the section if available
    if (this.pointDetails.sectionId) {
      this.selectedSection = {
        id: this.pointDetails.sectionId,
        name: this.pointDetails.sectionName || '',
      };
    }

    // Load dependent location data
    this.loadDependentData();
  }

  private async loadDependentData(): Promise<void> {
    if (!this.pointDetails) return;

    this.isLoading = true;

    try {
      // 1. Load areas for the country
      await this.loadAreasByCountry(this.pointDetails.countryName);

      // 2. Set selected area if areaId exists
      if (this.pointDetails.areaId) {
        this.selectedArea =
          this.areas.find((a) => a.id === this.pointDetails?.areaId) || null;

        // 3. Load cities for the selected area
        if (this.selectedArea) {
          await this.loadCitiesByArea(this.selectedArea.id);

          // 4. Set selected city if cityId exists
          if (this.pointDetails.cityId) {
            this.selectedCity =
              this.cities.find((c) => c.id === this.pointDetails?.cityId) ||
              null;

            // 5. Load organizations for the selected city
            if (this.selectedCity) {
              await this.loadOrganizationsByCity(this.selectedCity.id);

              // 6. Set selected organization if organizationId exists
              if (this.pointDetails.organizationId) {
                this.selectedOrganization =
                  this.organizations.find(
                    (o) => o.id === this.pointDetails?.organizationId
                  ) || null;

                // 7. Load buildings for the selected organization
                if (this.selectedOrganization) {
                  await this.loadBuildingsByOrganization(
                    this.selectedOrganization.id
                  );

                  // 8. Set selected building if buildingId exists
                  if (this.pointDetails.buildingId) {
                    this.selectedBuilding =
                      this.buildings.find(
                        (b) => b.id === this.pointDetails?.buildingId
                      ) || null;

                    // 9. Load floors for the selected building
                    if (this.selectedBuilding) {
                      await this.loadFloorsByBuilding(this.selectedBuilding.id);

                      // 10. Set selected floor if floorId exists
                      if (this.pointDetails.floorId) {
                        this.selectedFloor =
                          this.floors.find(
                            (f) => f.id === this.pointDetails?.floorId
                          ) || null;

                        // 11. Load sections for the selected floor
                        if (this.selectedFloor) {
                          await this.loadSectionsByFloor(this.selectedFloor.id);

                          // 12. Set selected section if sectionId exists
                          if (this.pointDetails.sectionId) {
                            this.selectedSection =
                              this.sections.find(
                                (s) => s.id === this.pointDetails?.sectionId
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
        }
      }
    } catch (error) {
      console.error('Error loading dependent data:', error);
      this.showErrorToast('Failed to load location data');
    } finally {
      this.isLoading = false;
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

  private loadSectionsByFloor(floorId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.filterBarService.loadSectionsByFloor(floorId).subscribe({
        next: (sections) => {
          this.sections = sections || [];
          resolve();
        },
        error: (error) => {
          console.error('Error fetching sections:', error);
          this.showErrorToast('Failed to load sections');
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
          'section',
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
        this.resetSelections([
          'city',
          'organization',
          'building',
          'floor',
          'section',
        ]);
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
        this.resetSelections(['organization', 'building', 'floor', 'section']);
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
        this.resetSelections(['building', 'floor', 'section']);
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
        this.resetSelections(['floor', 'section']);
        this.currentStep = 6;
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  onFloorSelect(): void {
    if (!this.selectedFloor) return;

    this.isLoading = true;
    this.loadSectionsByFloor(this.selectedFloor.id)
      .then(() => {
        this.resetSelections(['section']);
        this.currentStep = 7;
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
    if (types.includes('section')) this.selectedSection = null;
  }

  // Navigation methods
  nextStep(): void {
    if (this.currentStep < 9) {
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
      7: () =>
        this.validateSelection(this.selectedSection, 'Please select a section'),
      8: () => this.validatePointDetails(),
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

  private validatePointDetails(): boolean {
    const validations = [
      {
        field: this.pointName,
        message: 'Point name must be at least 3 characters',
        minLength: 3,
      },
      {
        field: this.pointNumber,
        message: 'Point number must be at least 3 characters',
        minLength: 3,
      },
      {
        field: this.pointDescription,
        message: 'Point description must be at least 3 characters',
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
  // Form submission
  complete(): void {
    if (!this.validateCurrentStep() || !this.selectedSection) return;

    const pointData: CreateEditPointModel = {
      ...(this.isEditMode && this.pointId && { id: this.pointId }),
      name: this.pointName,
      number: this.pointNumber,
      description: this.pointDescription,
      sectionId: this.selectedSection.id,
      userIds: [
        ...this.selectedManagers,
        ...this.selectedSupervisors,
        ...this.selectedCleaners,
      ],
      deviceId: this.selectedSensor, // Change from deviceIds: this.selectedSensors
    };

    this.isSubmitting = true;

    const operation = this.isEditMode
      ? this.pointService.updatePoint(pointData)
      : this.pointService.createPoint(pointData);

    operation.subscribe({
      next: () => {
        const message = this.isEditMode
          ? 'Point updated successfully!'
          : 'Point created successfully!';
        this.showSuccessAlert(message);
        this.resetForm();
        this.router.navigate(['admin', 'point']);
      },
      error: (error) => {
        console.error(
          `Error ${this.isEditMode ? 'updating' : 'creating'} point:`,
          error
        );
        const title = this.isEditMode
          ? 'Error updating point'
          : 'Error creating point';
        this.showErrorAlert(title, error.message || 'Please try again later.');
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }

  private resetForm(): void {
    this.pointName = '';
    this.pointNumber = '';
    this.pointDescription = '';
    this.selectedCountry = '';
    this.selectedArea = null;
    this.selectedCity = null;
    this.selectedOrganization = null;
    this.selectedBuilding = null;
    this.selectedFloor = null;
    this.selectedSection = null;
    this.selectedManagers = [];
    this.selectedSupervisors = [];
    this.selectedCleaners = [];
    this.selectedShifts = [];
    this.selectedSensor = undefined; // Reset to undefined
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
      !!this.selectedSection &&
      !!this.pointName &&
      this.pointName.length >= 3
    );
  }

  get pageTitle(): string {
    return this.isEditMode
      ? 'POINT_EDIT.PAGE_TITLE'
      : 'POINT_CREATION.PAGE_TITLE';
  }

  get pageSubtitle(): string {
    return this.isEditMode
      ? 'POINT_EDIT.PAGE_SUBTITLE'
      : 'POINT_CREATION.PAGE_SUBTITLE';
  }

  get submitButtonText(): string {
    if (this.isSubmitting) {
      return this.isEditMode
        ? 'POINT_EDIT.DETAILS.UPDATING'
        : 'POINT_CREATION.DETAILS.CREATING';
    }
    return this.isEditMode
      ? 'POINT_EDIT.DETAILS.UPDATE_POINT'
      : 'POINT_CREATION.DETAILS.CREATE_POINT';
  }
}
