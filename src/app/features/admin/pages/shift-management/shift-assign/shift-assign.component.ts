// Angular Core Modules
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Angular Material Modules
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';

// HTTP and RxJS
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Third-party Libraries
import Swal from 'sweetalert2';
import { environment } from '../../../../../../environments/environment';
import { TranslateModule } from '@ngx-translate/core';
import { OrganizationService } from '../../../services/work-location/organization.service';
import { BuildingService } from '../../../services/work-location/building.service';
import { FloorService } from '../../../services/work-location/floor.service';
import { SectionService } from '../../../services/work-location/section.service';
import { UserService } from '../../../services/user.service';
import { ShiftService } from '../../../services/shift.service';

@Component({
  selector: 'app-shift-assign',
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    TranslateModule,
  ],
  templateUrl: './shift-assign.component.html',
  styleUrl: './shift-assign.component.scss',
})
export class ShiftAssignComponent {
  // ======================
  // Component Properties
  // ======================

  // API Configuration
  private readonly apiBaseUrl = `${environment.apiUrl}/assign`;

  // Role Configuration
  readonly roles = [
    { label: 'Manager', value: 2 },
    { label: 'Supervisor', value: 3 },
    { label: 'Cleaner', value: 4 },
  ];

  // Assignment Levels
  readonly levels = ['Organization', 'Building', 'Floor', 'section'];

  // Data State
  dataByLevel: { [key: string]: any[] } = {};
  individuals: { id: number; name: string; assigned: boolean }[] = [];
  shifts: any[] = [];
  assignments: {
    role?: string;
    users?: string;
    level?: string;
    specific?: string;
    shifts: string[];
  }[] = [];

  // Selection State
  selectedRole: number | null = null;
  selectedUsers: { id: number; name: string }[] = [];
  selectedLevel: string | null = null;
  selectedSpecificOption: { id: number; name: string } | null = null;
  selectedUserId: number | null = null;
  selectedUser: any = null;
  selectedShifts: number[] = [];
  userShifts: number[] = [];
  selectedAssignmentType: 'user' | 'level' | null = null;

  // Step Management
  currentStep = 1;
  readonly totalSteps = 4;
  today: Date = new Date();

  // ======================
  // Constructor
  // ======================

  constructor(
    private http: HttpClient,
    private organizationService: OrganizationService,
    private buildingService: BuildingService,
    private floorService: FloorService,
    private sectionService: SectionService,
    private userService: UserService,
    private shiftUseCase: ShiftService
  ) {}

  // ======================
  // Lifecycle Hooks
  // ======================

  ngOnInit(): void {
    this.fetchShifts();
  }

  // ======================
  // Data Fetching Methods
  // ======================

  /**
   * Fetches all available shifts from the API
   */
  fetchShifts(): void {
    this.shiftUseCase.getPaginatedShifts({ pageNumber: 1 }).subscribe({
      next: (response: any) => {
        this.shifts = response.data.data.map((shift: any) => ({
          id: shift.id,
          name: shift.name,
        }));
      },
      error: (err) => {
        console.error('Error fetching shifts:', err);
      },
    });
  }

  /**
   * Fetches data based on the selected organizational level
   * @param level The organizational level to fetch data for
   */
  fetchDataByLevel(level: string): void {
    const levelServiceMap: { [key: string]: () => Observable<any> } = {
      Organization: () => this.organizationService.getOrganizationShift(),
      Building: () => this.buildingService.getBuildingShift(),
      Floor: () => this.floorService.getFloorShift(),
      section: () => this.sectionService.getSectionShift(),
    };

    const serviceFunction = levelServiceMap[level];

    if (serviceFunction) {
      serviceFunction().subscribe({
        next: (response: any) => {
          this.dataByLevel[level] =
            response.data?.map((entity: any) => ({
              id: entity.id,
              name: entity.name,
              shifts: entity.shifts.map((shift: any) => shift.id),
            })) || [];
        },
        error: (err: any) => {
          console.error(`Error fetching data for ${level}:`, err);
          this.dataByLevel[level] = [];
        },
      });
    } else {
      console.error(`No service function defined for level: ${level}`);
      this.dataByLevel[level] = [];
    }
  }

  /**
   * Fetches users by their role
   * @param roleId The ID of the role to filter users by
   */
  fetchUsersByRole(roleId: number): void {
    this.userService.getUserWithShiftById(roleId).subscribe({
      next: (response) => {
        if (response && Array.isArray(response)) {
          this.individuals = response.map((user: any) => {
            const userShiftIds = user.shifts
              ? user.shifts.map((shift: any) => shift.id)
              : [];
            const userShiftNames = user.shifts
              ? user.shifts.map((shift: any) => shift.name)
              : [];

            return {
              id: user.id,
              name: `${user.firstName} ${user.lastName}`,
              shiftIds: userShiftIds,
              shiftNames: userShiftNames,
              assigned: false,
            };
          });
        } else {
          console.warn('Unexpected response format:', response);
          this.individuals = [];
        }
      },
      error: (err) => {
        console.error('Error fetching users by role:', err);
      },
    });
  }

  /**
   * Fetches shifts assigned to a specific user
   * @param userId The ID of the user to fetch shifts for
   */
  fetchUserShifts(userId: number): void {
    this.userService.getUserWithShiftById(userId).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.userShifts = response.data;
        } else {
          this.userShifts = [];
          Swal.fire({
            title: 'Error!',
            text: 'Failed to fetch shifts for the selected user.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      },
      error: (err) => {
        console.error('Error fetching user shifts:', err);
        this.userShifts = [];
        Swal.fire({
          title: 'Error!',
          text: 'Failed to fetch shifts for the selected user. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      },
    });
  }

  // ======================
  // Event Handlers
  // ======================

  /**
   * Handles assignment type selection change
   * @param type The selected assignment type ('user' or 'level')
   */
  onAssignmentTypeChange(type: 'user' | 'level'): void {
    this.selectedUsers = [];
    this.selectedUser = null;
    this.selectedLevel = null;
    this.selectedSpecificOption = null;
    this.selectedShifts = [];

    if (type === 'user' || type === 'level') {
      this.selectedAssignmentType = type;
    } else {
      console.error('Invalid assignment type selected.');
    }

    this.currentStep = 2;
    this.fetchShifts();
  }

  /**
   * Handles user selection
   * @param user The selected user object
   */
  onUserSelect(user: any): void {
    if (user) {
      this.selectedUsers = [user];
      this.userShifts = user.shiftIds || [];
      this.selectedShifts = [...this.userShifts];
    } else {
      console.error('No user selected.');
    }
    this.currentStep = 3;
  }

  /**
   * Handles specific option selection change
   */
  onSpecificOptionChange(): void {
    if (this.selectedSpecificOption && this.selectedLevel) {
      const selectedEntity = this.dataByLevel[this.selectedLevel]?.find(
        (entity: any) => entity.id === this.selectedSpecificOption?.id
      );

      if (selectedEntity) {
        this.selectedShifts = selectedEntity.shifts || [];
      } else {
        console.error(`Selected ${this.selectedLevel} not found.`);
      }
    } else {
      console.error('No specific option or level selected.');
    }

    this.currentStep = 3;
  }

  /**
   * Handles role selection change
   */
  onRoleChange(): void {
    if (this.selectedRole !== null) {
      this.fetchUsersByRole(this.selectedRole);
    } else {
      this.individuals = [];
    }
  }

  /**
   * Handles level selection change
   */
  onLevelChange(): void {
    if (this.selectedLevel) {
      this.fetchDataByLevel(this.selectedLevel);
    }
  }

  // ======================
  // Assignment Methods
  // ======================

  /**
   * Main assignment method that routes to specific assignment methods
   */
  assign(): void {
    if (this.selectedUsers.length > 0) {
      this.assignShiftsToUsers();
    } else if (this.selectedSpecificOption && this.selectedLevel) {
      this.assignShiftsToLevel();
    } else {
      console.error('Incomplete data: Please select users or a level option.');
      return;
    }
  }

  /**
   * Assigns shifts to selected users
   */
  private assignShiftsToUsers(): void {
    if (this.selectedUsers.length === 0) {
      this.showErrorAlert('No users selected for assignment.');
      return;
    }

    const apiUrl = `${this.apiBaseUrl}/user/shift`;
    const payload = {
      userId: this.selectedUsers.length === 1 ? this.selectedUsers[0].id : null,
      shiftIds: this.selectedShifts || [],
    };

    this.http.post(apiUrl, payload, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.showSuccessAlert('Shifts successfully assigned to users.');
        this.addUserAssignmentToHistory();
        this.resetSelections();
      },
      error: (err) => {
        console.error('Error assigning shifts to users:', err);
        this.showErrorAlert(
          'Failed to assign shifts to users. Please try again.'
        );
      },
    });
  }

  /**
   * Assigns shifts to selected organizational level
   */
  private assignShiftsToLevel(): void {
    if (!this.selectedSpecificOption) {
      this.showErrorAlert('No specific option selected for assignment.');
      return;
    }

    const levelKey = `${this.selectedLevel
      ?.charAt(0)
      .toUpperCase()}${this.selectedLevel?.slice(1).toLowerCase()}Id`;

    const apiUrl = `${
      this.apiBaseUrl
    }/${this.selectedLevel?.toLowerCase()}/shift`;
    const payload = {
      [levelKey]: this.selectedSpecificOption.id,
      shiftIds: this.selectedShifts || [],
    };

    this.http.post(apiUrl, payload, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.showSuccessAlert(
          `Shifts successfully assigned to ${this.selectedLevel}.`
        );
        this.addLevelAssignmentToHistory();
        this.resetSelections();
      },
      error: (err) => {
        console.error(`Error assigning shifts to ${this.selectedLevel}:`, err);
        this.showErrorAlert(
          `Failed to assign shifts to ${this.selectedLevel}. Please try again.`
        );
      },
    });
  }

  // ======================
  // Helper Methods
  // ======================

  /**
   * Creates HTTP headers with authorization token
   * @returns HttpHeaders with authorization token
   */
  private getHeaders(): HttpHeaders {
    const userData = localStorage.getItem('userData');
    const token = userData ? JSON.parse(userData).token : null;

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  /**
   * Shows success alert
   * @param message The success message to display
   */
  private showSuccessAlert(message: string): void {
    Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      confirmButtonText: 'OK',
    });
  }

  /**
   * Shows error alert
   * @param message The error message to display
   */
  private showErrorAlert(message: string): void {
    Swal.fire({
      title: 'Error!',
      text: message,
      icon: 'error',
      confirmButtonText: 'OK',
    });
  }

  /**
   * Adds user assignment to history
   */
  private addUserAssignmentToHistory(): void {
    this.assignments.push({
      role: this.getRoleName(this.selectedRole),
      users: this.selectedUsers.map((user) => user.name).join(', '),
      shifts: this.getShiftNames(this.selectedShifts),
    });
  }

  /**
   * Adds level assignment to history
   */
  private addLevelAssignmentToHistory(): void {
    this.assignments.push({
      level: this.selectedLevel || '',
      specific: this.selectedSpecificOption?.name || '',
      shifts: this.getShiftNames(this.selectedShifts),
    });
  }

  /**
   * Gets shift names for given shift IDs
   * @param shiftIds Array of shift IDs
   * @returns Array of shift names
   */
  private getShiftNames(shiftIds: number[]): string[] {
    return shiftIds.map(
      (shiftId) => this.shifts.find((shift) => shift.id === shiftId)?.name || ''
    );
  }

  /**
   * Gets role name for given role ID
   * @param roleId The role ID
   * @returns The role name
   */
  getRoleName(roleId: number | null): string {
    if (!roleId) return '';
    return this.roles.find((role) => role.value === roleId)?.label || '';
  }

  /**
   * Gets shift name for given shift ID
   * @param shiftId The shift ID
   * @returns The shift name
   */
  getShiftName(shiftId: number): string {
    return this.shifts.find((shift) => shift.id === shiftId)?.name || '';
  }

  /**
   * Gets users for multi-select dropdown
   * @returns Array of users
   */
  getMultiSelectUsers(): { id: number; name: string; assigned: boolean }[] {
    return this.individuals;
  }

  /**
   * Gets specific options for selected level
   * @returns Array of options
   */
  getSpecificOptions(): { id: number; name: string }[] {
    return this.selectedLevel ? this.dataByLevel[this.selectedLevel] || [] : [];
  }

  /**
   * Checks if shift is assigned to user
   * @param shiftId The shift ID to check
   * @returns Boolean indicating if shift is assigned
   */
  isShiftAssigned(shiftId: number): boolean {
    return this.userShifts.includes(shiftId);
  }

  /**
   * Removes shift from selected shifts
   * @param shiftId The shift ID to remove
   */
  removeShift(shiftId: number): void {
    this.selectedShifts = this.selectedShifts.filter((id) => id !== shiftId);
  }

  // ======================
  // Step Navigation Methods
  // ======================

  /**
   * Navigates to specific step
   * @param stepNumber The step number to navigate to
   */
  goToStep(stepNumber: number): void {
    if (this.canGoToStep(stepNumber)) {
      this.currentStep = stepNumber;
    }
  }

  /**
   * Checks if navigation to step is allowed
   * @param stepNumber The step number to check
   * @returns Boolean indicating if navigation is allowed
   */
  canGoToStep(stepNumber: number): boolean {
    if (stepNumber === 1) return true;
    if (stepNumber === 2) return !!this.selectedAssignmentType;
    if (stepNumber === 3) {
      return (
        (this.selectedAssignmentType === 'user' && this.selectedUser) ||
        (this.selectedAssignmentType === 'level' && this.selectedSpecificOption)
      );
    }
    if (stepNumber === 4) return this.selectedShifts.length > 0;
    return false;
  }

  /**
   * Checks if step is completed
   * @param stepNumber The step number to check
   * @returns Boolean indicating if step is completed
   */
  isStepCompleted(stepNumber: number): boolean {
    switch (stepNumber) {
      case 1:
        return !!this.selectedAssignmentType;
      case 2:
        return (
          (this.selectedAssignmentType === 'user' && !!this.selectedUser) ||
          (this.selectedAssignmentType === 'level' &&
            !!this.selectedSpecificOption)
        );
      case 3:
        return this.selectedShifts.length > 0;
      case 4:
        return false;
      default:
        return false;
    }
  }

  /**
   * Resets all selections
   */
  resetSelections(): void {
    this.selectedRole = null;
    this.selectedUsers = [];
    this.selectedLevel = null;
    this.selectedSpecificOption = null;
    this.selectedShifts = [];
    this.selectedUserId = null;
    this.selectedUser = null;
    this.userShifts = [];
    this.selectedAssignmentType = null;
    this.currentStep = 1;
  }
}
