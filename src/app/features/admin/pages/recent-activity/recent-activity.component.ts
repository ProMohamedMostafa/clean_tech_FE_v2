import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '../../services/user.service';
import { LogsService } from '../../services/logs.service';
import { getUserRole } from '../../../../core/helpers/auth.helpers';

@Component({
  selector: 'app-recent-activity',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './recent-activity.component.html',
  styleUrl: './recent-activity.component.scss',
})
export class RecentActivityComponent implements OnInit {
  logs: any[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  totalCount: number = 0;
  pageSize: number = 10; // Default page size
  showFilterModal: boolean = false;
  users: any['data'] = [];
  myActivity: boolean = true;
  userRole: string = getUserRole().toLowerCase(); // Default role

  // Filter Fields
  selectedModule: number | any = null;
  selectedAction: number | null = null;
  selectedRole: number | null = null;
  selectedUser: number | null = null;
  startDate: string | null = null;
  endDate: string | null = null;

  // Module and Action lists
  actionMap: { [key: string]: number } = {
    Create: 0,
    Edit: 1,
    Delete: 2,
    Restore: 3,
    ForceDelete: 4,
    Login: 5,
    Logout: 6,
    'Clock In/Out': 7,
    'Change Password': 8,
    'Edit Profile': 9,
    Assign: 10,
    'Remove Assign': 11,
    'Stock In': 12,
    'Stock Out': 13,
    'Change Status': 14,
    Comment: 15,
    'Edit Setting': 16,
  };

  // Mapping Modules to Allowed Actions
  moduleActionMap: { [key: number]: string[] } = {
    0: ['Create', 'Edit', 'Delete', 'ForceDelete', 'Restore'], // Provider
    1: [
      'Create',
      'Edit',
      'Delete',
      'Restore',
      'ForceDelete',
      'Assign',
      'Remove Assign',
      'Login',
      'Logout',
      'Clock In/Out',
      'Change Password',
      'Edit Profile',
      'Edit Setting',
    ], // User
    2: [
      'Create',
      'Edit',
      'Delete',
      'Restore',
      'ForceDelete',
      'Login',
      'Logout',
      'Clock In/Out',
      'Change Password',
      'Edit Profile',
      'Assign',
      'Remove Assign',
      'Edit Setting',
    ], // User Setting
    3: [
      'Create',
      'Edit',
      'Delete',
      'Restore',
      'ForceDelete',
      'Assign',
      'Remove Assign',
    ], // Area
    4: [
      'Create',
      'Edit',
      'Delete',
      'Restore',
      'ForceDelete',
      'Assign',
      'Remove Assign',
    ], // City
    5: [
      'Create',
      'Edit',
      'Delete',
      'Restore',
      'ForceDelete',
      'Assign',
      'Remove Assign',
    ], // Organization
    6: [
      'Create',
      'Edit',
      'Delete',
      'Restore',
      'ForceDelete',
      'Assign',
      'Remove Assign',
    ], // Building
    7: [
      'Create',
      'Edit',
      'Delete',
      'Restore',
      'ForceDelete',
      'Assign',
      'Remove Assign',
    ], // Floor
    8: [
      'Create',
      'Edit',
      'Delete',
      'Restore',
      'ForceDelete',
      'Assign',
      'Remove Assign',
    ], // Section
    9: [
      'Create',
      'Edit',
      'Delete',
      'Restore',
      'ForceDelete',
      'Assign',
      'Remove Assign',
    ], // Point
    10: [
      'Create',
      'Edit',
      'Delete',
      'Restore',
      'ForceDelete',
      'Comment',
      'Change Status',
    ], // Task
    11: [
      'Create',
      'Edit',
      'Delete',
      'Restore',
      'ForceDelete',
      'Assign',
      'Remove Assign',
    ], // Shift
    12: ['Clock In/Out'], // Attendance
    13: ['Create', 'Edit', 'Delete', 'ForceDelete'], // Leave
    14: ['Create', 'Edit', 'Delete', 'Restore', 'ForceDelete'], // Category
    15: ['Create', 'Edit', 'Delete', 'Restore', 'ForceDelete'], // Material
    16: [
      'Create',
      'Edit',
      'Delete',
      'Restore',
      'ForceDelete',
      'Stock In',
      'Stock Out',
    ], // Stock
    17: ['Create', 'Edit', 'Delete', 'Restore', 'ForceDelete'], // Sensor
    18: ['Create', 'Edit', 'Delete', 'Restore', 'ForceDelete'], // Feedback
    19: ['Create', 'Edit', 'Delete', 'Restore', 'ForceDelete'], // Question
    20: ['Create', 'Edit', 'Delete', 'Restore', 'ForceDelete'], // Device
  };

  moduleKeys: number[] = Object.keys(this.moduleActionMap).map(Number);
  moduleNames: string[] = [
    'Provider',
    'User',
    'User Setting',
    'Area',
    'City',
    'Organization',
    'Building',
    'Floor',
    'Section',
    'Point',
    'Task',
    'Shift',
    'Attendance',
    'Leave',
    'Category',
    'Material',
    'Stock',
    'Sensor',
    'Feedback',
    'Question',
    'Device',
  ];

  availableActions: string[] = [];

  // Search query
  searchQuery: string = '';
  private searchSubject = new Subject<string>(); // Used for debouncing search input

  constructor(
    private logsService: LogsService,
    private userManagementService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchData();
    this.loadPaginatedUsers();

    // Debounce search input
    this.searchSubject.pipe(debounceTime(500)).subscribe(() => {
      this.currentPage = 1; // Reset to first page when searching
      this.fetchData();
    });
  }

  private getRoutePrefix(): string {
    return `/${this.userRole}`;
  }

  setActivityFilter(isMyActivity: boolean) {
    this.myActivity = isMyActivity;
    this.currentPage = 1; // Reset to first page when changing filter
    this.fetchData(); // Fetch filtered data
  }

  fetchData() {
    const actionNumber =
      this.selectedAction !== null
        ? this.actionMap[this.selectedAction]
        : undefined;

    console.log(actionNumber, this.selectedModule);

    this.logsService
      .getLogs(
        this.currentPage,
        this.pageSize,
        this.searchQuery?.trim() || undefined, // Added searchQuery for filtering
        this.selectedRole ?? undefined,
        this.selectedUser ?? undefined,
        this.startDate ?? undefined,
        this.endDate ?? undefined,
        actionNumber, // Send action as a number
        this.selectedModule ?? undefined,
        this.myActivity
      )
      .subscribe(
        (response) => {
          if (response.succeeded && response.data) {
            // Fix: Extract the actual logs array from the nested data structure
            this.logs = response.data || []; // The logs are in response.data.data
            this.totalCount = response.data.totalCount || 0;
            this.totalPages = response.data.totalPages || 1;
            this.currentPage = response.data.currentPage || 1;
            this.pageSize = response.data.pageSize || 10;
          } else {
            // Handle error case
            this.logs = [];
            this.totalCount = 0;
            this.totalPages = 1;
            this.currentPage = 1;
          }
        },
        (error) => {
          console.error('Error fetching logs:', error);
          // Reset data on error
          this.logs = [];
          this.totalCount = 0;
          this.totalPages = 1;
          this.currentPage = 1;
        }
      );
  }

  onModuleChange(): void {
    console.log('Selected Module:', this.selectedModule);
    this.availableActions =
      this.selectedModule !== null
        ? this.moduleActionMap[this.selectedModule] || []
        : [];

    console.log('Available Actions:', this.availableActions);
    this.selectedAction = null;
  }

  onSearchChange() {
    this.searchSubject.next(this.searchQuery); // Trigger search with debounce
  }

  applyFilters() {
    this.currentPage = 1; // Reset to first page when applying filters
    this.fetchData();
    this.closeFilterModal();
  }

  resetFilters() {
    this.selectedModule = null;
    this.selectedAction = null;
    this.selectedRole = null;
    this.selectedUser = null;
    this.startDate = null;
    this.endDate = null;
    this.searchQuery = '';
    this.currentPage = 1; // Reset to first page when resetting filters
    this.fetchData();
  }

  loadPaginatedUsers() {
    this.userManagementService
      .getUsersWithPagination({ PageNumber: 1 })
      .subscribe({
        next: (response) => {
          if (response.succeeded && response.data) {
            this.users = response.data.data;
          } else {
            console.error('Failed to fetch users:', response.message);
          }
        },
        error: (err) => {
          console.error('Error fetching users:', err);
        },
      });
  }

  changePage(page: number) {
    // Add validation to ensure page is within valid range
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;

    this.currentPage = page;
    this.fetchData(); // Fetch new data based on page change
  }

  onPageClick(page: any): void {
    if (page !== '...' && typeof page === 'number') {
      this.changePage(page);
    }
  }

  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const total = this.totalPages;
    const current = this.currentPage;

    // Handle case where there are no pages
    if (total === 0) return [];

    if (total <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (current > 4) {
        pages.push('...');
      }

      // Calculate range around current page
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      // Add pages around current page
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== total) {
          // Don't duplicate first and last
          pages.push(i);
        }
      }

      if (current < total - 3) {
        pages.push('...');
      }

      // Always show last page (if more than 1 page)
      if (total > 1) {
        pages.push(total);
      }
    }

    return pages;
  }

  getActivityClass(actionType: string): string {
    const classes: { [key: string]: string } = {
      Create: 'bg-success text-white', // Green
      Edit: 'bg-warning text-dark', // Yellow
      Delete: 'bg-info text-white', // Blue
      Restore: 'bg-danger text-white', // Red
      ForceDelete: 'bg-danger text-white',
      Login: 'bg-success text-white',
      Logout: 'bg-success text-white',
      ClockInOut: 'bg-info text-white',
      ChangePassword: 'bg-warning text-dark',
      EditProfile: 'bg-warning text-dark',
      Assign: 'bg-success text-white',
      RemoveAssign: 'bg-info text-white',
      StockIn: 'bg-success text-white',
      StockOut: 'bg-info text-white',
      ChangeStatus: 'bg-warning text-dark',
      Comment: 'bg-info text-white',
      EditSetting: 'bg-warning text-dark',
    };

    return classes[actionType] || 'bg-secondary text-dark';
  }

  getActivityIcon(actionType: string): string {
    const icons: { [key: string]: string } = {
      Create: 'fas fa-plus-circle', // Plus icon for creation
      Edit: 'fas fa-edit', // Edit icon
      Delete: 'fas fa-trash-alt', // Trash icon
      Restore: 'fas fa-undo', // Restore icon
      ForceDelete: 'fas fa-times-circle', // Force delete icon
      Login: 'fas fa-sign-in-alt', // Login icon
      Logout: 'fas fa-sign-out-alt', // Logout icon
      ClockInOut: 'fas fa-clock', // Clock icon
      ChangePassword: 'fas fa-key', // Key icon for password change
      EditProfile: 'fas fa-user-edit', // Profile edit icon
      Assign: 'fas fa-user-plus', // User assign icon
      RemoveAssign: 'fas fa-user-minus', // User remove icon
      StockIn: 'fas fa-box-open', // Stock in icon
      StockOut: 'fas fa-box', // Stock out icon
      ChangeStatus: 'fas fa-toggle-on', // Toggle switch icon
      Comment: 'fas fa-comment', // Comment icon
      EditSetting: 'fas fa-cogs', // Settings icon,
    };

    return icons[actionType] || 'fas fa-info-circle';
  }

  getMinValue(): number {
    // Fix: Calculate the correct "showing to" value
    const startItem = (this.currentPage - 1) * this.pageSize + 1;
    const endItem = Math.min(this.currentPage * this.pageSize, this.totalCount);
    return endItem;
  }

  // Add helper method for "showing from" value
  getShowingFrom(): number {
    return this.totalCount === 0
      ? 0
      : (this.currentPage - 1) * this.pageSize + 1;
  }

  /** Filter Modal Handling */
  openFilterModal(): void {
    this.showFilterModal = true;
  }

  closeFilterModal(): void {
    this.showFilterModal = false;
  }

  navigateToModule(log: any) {
    // Stop navigation here if the role is cleaner
    if (this.userRole.toLowerCase() === 'cleaner') {
      return; // Do nothing for cleaner role
    }

    let route = '';
    const prefix = this.getRoutePrefix();

    switch (log.module) {
      case 'Provider':
        route = log.moduleId
          ? `${prefix}/provider-management/${log.moduleId}`
          : `${prefix}/provider-management`;
        break;
      case 'User':
      case 'User Setting':
        route = log.moduleId
          ? `${prefix}/user-details/${log.moduleId}`
          : `${prefix}/user-management`;
        break;
      case 'Area':
        route = log.moduleId
          ? `${prefix}/area-details/${log.moduleId}`
          : `${prefix}/area`;
        break;
      case 'City':
        route = log.moduleId
          ? `${prefix}/city-details/${log.moduleId}`
          : `${prefix}/city`;
        break;
      case 'Organization':
        route = log.moduleId
          ? `${prefix}/organization-details/${log.moduleId}`
          : `${prefix}/organization`;
        break;
      case 'Building':
        route = log.moduleId
          ? `${prefix}/building-details/${log.moduleId}`
          : `${prefix}/building`;
        break;
      case 'Floor':
        route = log.moduleId
          ? `${prefix}/floor-details/${log.moduleId}`
          : `${prefix}/floor`;
        break;
      case 'Section':
        route = log.moduleId
          ? `${prefix}/section-details/${log.moduleId}`
          : `${prefix}/section`;
        break;
      case 'Point':
        route = log.moduleId
          ? `${prefix}/point-details/${log.moduleId}`
          : `${prefix}/point`;
        break;
      case 'Task':
        route = log.moduleId
          ? `${prefix}/task-details/${log.moduleId}`
          : `${prefix}/tasks`;
        break;
      case 'Shift':
        route = log.moduleId
          ? `${prefix}/shift-details/${log.moduleId}`
          : `${prefix}/shift`;
        break;
      case 'Attendance':
        route = `${prefix}/attendance/history`;
        break;
      case 'Leave':
        route = log.moduleId
          ? `${prefix}/leave-details/${log.moduleId}`
          : `${prefix}/leave`;
        break;
      case 'Category':
        route = `${prefix}/category`;
        break;
      case 'Material':
        route = log.moduleId
          ? `${prefix}/material-details/${log.moduleId}`
          : `${prefix}/material`;
        break;
      case 'Stock':
        route = `${prefix}/transaction`;
        break;
      case 'Sensor':
        route = log.moduleId
          ? `${prefix}/sensor-details/${log.moduleId}`
          : `${prefix}/sensor`;
        break;
      case 'Feedback':
        route = log.moduleId
          ? `${prefix}/feedback/${log.moduleId}`
          : `${prefix}/feedback`;
        break;
      case 'Question':
        route = `${prefix}/questions`;
        break;
      case 'Device':
        route = `${prefix}/devices`;
        break;
      default:
        return; // Do nothing if module is unknown
    }

    this.router.navigate([route]);
  }
}
