import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

// Services
import { AreaService } from '../../services/work-location/area.service';
import { RoleService } from '../../../../core/services/role.service';
import { CityService } from '../../services/work-location/city.service';
import { OrganizationService } from '../../services/work-location/organization.service';
import { BuildingService } from '../../services/work-location/building.service';
import { FloorService } from '../../services/work-location/floor.service';
import { SectionService } from '../../services/work-location/section.service';
import { PointService } from '../../services/work-location/point.service';
import { UserService } from '../../services/user.service';

// Environment
import { environment } from '../../../../../environments/environment';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-user-location-assign',
  templateUrl: './user-location-assign.component.html',
  styleUrls: ['./user-location-assign.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    TranslateModule,
  ],
})
export class UserLocationAssignComponent {
  // ========================
  // API CONFIGURATION
  // ========================
  private readonly apiBaseUrl = `${environment.apiUrl}/assign`;

  // ========================
  // DROPDOWN OPTIONS
  // ========================
  readonly roles = [
    { label: 'Manager', value: 2 },
    { label: 'Supervisor', value: 3 },
    { label: 'Cleaner', value: 4 },
  ];

  readonly levels = [
    'Area',
    'City',
    'Organization',
    'Building',
    'Floor',
    'Section',
    'Point',
  ];

  // ========================
  // STATE MANAGEMENT
  // ========================
  dataByLevel: { [key: string]: Array<{ id: number; name: string }> } = {};
  individuals: Array<{ id: number; name: string; assigned: boolean }> = [];
  selectedRole: number | null = null;
  selectedUsers: Array<{ id: number; name: string }> = [];
  selectedLevel: string | null = null;
  selectedSpecificOption: { id: number; name: string } | null = null;
  userIds: number[] = [];
  areaDetails: any = null;

  // Assignment History
  assignments: Array<{
    role: string;
    users: string;
    level: string;
    specific: string;
    timestamp?: Date;
  }> = [];

  // ========================
  // CONSTRUCTOR
  // ========================
  constructor(
    private userService: UserService,
    private areaService: AreaService,
    private roleService: RoleService,
    private http: HttpClient,
    private cityService: CityService,
    private organizationService: OrganizationService,
    private buildingService: BuildingService,
    private floorService: FloorService,
    private sectionService: SectionService,
    private pointService: PointService
  ) {}

  // ===========================================
  // STEP 1: LEVEL SELECTION LOGIC
  // ===========================================
  onLevelChange(): void {
    if (this.selectedLevel) {
      this.fetchDataByLevel(this.selectedLevel);
    }
  }

  private fetchDataByLevel(level: string): void {
    const serviceFunction = this.getLevelServiceFunction(level);

    if (!serviceFunction) {
      this.dataByLevel[level] = [];
      return;
    }

    serviceFunction().subscribe((response: any) => {
      this.handleLevelDataResponse(level, response);
    });
  }

  private getLevelServiceFunction(
    level: string
  ): (() => Observable<any>) | undefined {
    const serviceMap: { [key: string]: () => Observable<any> } = {
      Area: () =>
        this.areaService.getPaginatedAreas({
          PageNumber: 1,
          PageSize: undefined,
          SearchQuery: undefined,
          Country: undefined,
        }),
      City: () =>
        this.cityService.getCitiesPaged({
          PageNumber: 1,
          PageSize: undefined,
          SearchQuery: undefined,
          area: undefined,
          Country: undefined,
        }),
      Organization: () =>
        this.organizationService.getOrganizationsPaged({ PageNumber: 1 }),
      Building: () => this.buildingService.getBuildingsPaged({ PageNumber: 1 }),
      Floor: () => this.floorService.getFloorsPaged({ PageNumber: 1 }),
      Section: () => this.sectionService.getSectionsPaged({ PageNumber: 1 }),
      Point: () => this.pointService.getPointsPaged({ PageNumber: 1 }),
    };

    return serviceMap[level];
  }

  private handleLevelDataResponse(level: string, response: any): void {
    this.dataByLevel[level] =
      response.data?.map((item: any) => ({
        id: item.id,
        name: item.name,
      })) || [];
  }

  // ===========================================
  // STEP 2: SPECIFIC SELECTION LOGIC
  // ===========================================
  onSpecificOptionChange(): void {
    if (this.selectedSpecificOption && this.selectedLevel) {
      this.fetchLevelDetails();
    }
  }

  getSpecificOptions(): Array<{ id: number; name: string }> {
    return this.selectedLevel ? this.dataByLevel[this.selectedLevel] || [] : [];
  }

  private fetchLevelDetails(): void {
    const serviceFunction = this.getDetailServiceFunction();

    if (
      !serviceFunction ||
      !this.selectedSpecificOption ||
      !this.selectedLevel
    ) {
      return;
    }

    serviceFunction(this.selectedSpecificOption.id).subscribe(
      (response: any) => {
        this.handleLevelDetailResponse(response);
      }
    );
  }

  private getDetailServiceFunction():
    | ((id: number) => Observable<any>)
    | undefined {
    if (!this.selectedLevel) return undefined;

    const serviceMap: { [key: string]: (id: number) => Observable<any> } = {
      Area: (id) => this.areaService.getAreaWithUser(id),
      City: (id) => this.cityService.getCityWithUsers(id),
      Organization: (id) =>
        this.organizationService.getOrganizationWithUsers(id),
      Building: (id) => this.buildingService.getBuildingWithUserShift(id),
      Floor: (id) => this.floorService.getFloorWithUserShift(id),
      Section: (id) => this.sectionService.getSectionWithUserShift(id),
      Point: (id) => this.pointService.getPointWithUser(id),
    };

    return serviceMap[this.selectedLevel];
  }

  private handleLevelDetailResponse(response: any): void {
    if (response?.data) {
      this.areaDetails = response.data;
      this.userIds = response.data.users?.map((user: any) => user.id) ?? [];

      if (this.selectedRole !== null) {
        this.fetchUsersByRole(this.selectedRole);
      }
    } else {
      this.areaDetails = null;
      this.userIds = [];
    }
  }

  // ===========================================
  // STEP 3: ROLE SELECTION LOGIC
  // ===========================================
  onRoleChange(): void {
    if (this.selectedRole !== null) {
      this.fetchUsersByRole(this.selectedRole);
    } else {
      this.individuals = [];
    }
  }

  private async fetchUsersByRole(roleId: number): Promise<void> {
    try {
      const response = await this.userService.getUsersByRole(roleId);
      this.handleUserResponse(response);
    } catch {
      this.individuals = [];
      this.selectedUsers = [];
    }
  }

  private getAssignedUsersByRole(): any[] {
    if (!this.areaDetails?.users) return [];

    if (this.selectedRole === null) {
      return this.areaDetails.users;
    }

    const roleMap: Record<string, number> = {
      Manager: 2,
      Supervisor: 3,
      Cleaner: 4,
    };

    return this.areaDetails.users.filter((user: any) => {
      const possibleRoleIds = [
        user.roleId,
        this.roles.find((r) => r.label === user.role)?.value,
        user.role === 'Manager'
          ? 2
          : user.role === 'Supervisor'
          ? 3
          : user.role === 'Cleaner'
          ? 4
          : undefined,
      ].filter((id) => id !== undefined);

      return possibleRoleIds.includes(this.selectedRole!);
    });
  }

  // ===========================================
  // STEP 4: USER SELECTION LOGIC
  // ===========================================
  getMultiSelectUsers(): Array<{
    id: number;
    name: string;
    assigned: boolean;
  }> {
    return this.individuals;
  }

  private handleUserResponse(response: any): void {
    const users = Array.isArray(response) ? response : [];

    if (!users.length) {
      this.individuals = [];
      this.selectedUsers = [];
      return;
    }

    const assignedUsers = this.getAssignedUsersByRole();
    const assignedUserIds = new Set(assignedUsers.map((u) => u.id));

    this.individuals = users.map((user: any) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`.trim() || user.userName,
      assigned: assignedUserIds.has(user.id),
    }));

    this.selectedUsers = this.individuals.filter((u) => u.assigned);
  }

  // ===========================================
  // ASSIGNMENT LOGIC
  // ===========================================
  assign(): void {
    if (!this.validateAssignmentData()) {
      this.showWarning('Please fill in all required fields before assigning.');
      return;
    }

    const payload = this.createAssignmentPayload();

    this.http.post(this.getAssignmentApiUrl(), payload).subscribe(() => {
      this.handleAssignmentSuccess();
    });
  }

  private validateAssignmentData(): boolean {
    return (
      !!this.selectedRole &&
      !!this.selectedLevel &&
      !!this.selectedSpecificOption
    );
  }

  private createAssignmentPayload(): any {
    const combinedUserIds = [
      ...this.selectedUsers.map((user) => user.id),
      ...this.userIds,
    ];

    return {
      [`${this.selectedLevel?.toLowerCase()}Id`]:
        this.selectedSpecificOption?.id,
      UserIds: combinedUserIds,
    };
  }

  private getAssignmentApiUrl(): string {
    return `${this.apiBaseUrl}/${this.selectedLevel?.toLowerCase()}/user`;
  }

  private handleAssignmentSuccess(): void {
    const roleLabel =
      this.roles.find((role) => role.value === this.selectedRole)?.label || '';

    this.assignments.push({
      role: roleLabel,
      users: this.selectedUsers.map((user) => user.name).join(', '),
      level: this.selectedLevel || 'Unknown',
      specific: this.selectedSpecificOption?.name || 'Unknown',
      timestamp: new Date(),
    });

    this.showSuccess('Assignment completed successfully.');
    this.clearSelection();
  }

  // ===========================================
  // CLEAR SELECTION LOGIC
  // ===========================================
  clearSelection(): void {
    this.selectedRole = null;
    this.selectedUsers = [];
    this.selectedLevel = null;
    this.selectedSpecificOption = null;
    this.individuals = [];
    this.areaDetails = null;
  }

  removeAssignment(assignment: any): void {
    this.assignments = this.assignments.filter((a) => a !== assignment);
  }

  // ===========================================
  // NOTIFICATION HELPERS
  // ===========================================
  private showSuccess(message: string): void {
    Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      confirmButtonText: 'OK',
    });
  }

  private showWarning(message: string): void {
    Swal.fire({
      title: 'Warning!',
      text: message,
      icon: 'warning',
      confirmButtonText: 'OK',
    });
  }
}
