// ==================== ANGULAR CORE & COMMON MODULES ====================
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// ==================== THIRD-PARTY LIBRARIES ====================
import { TranslateModule } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

// ==================== SERVICES & MODELS ====================
import { UserService } from '../../services/user.service';
import { UserModel } from '../../models/user.model';

// ==================== CUSTOM COMPONENTS ====================
import { UserCardsComponent } from '../../components/user-management/user-cards/user-cards.component';
import {
  TableDataComponent,
  TableColumn,
  TableAction,
} from '../../../../shared/components/table-data/table-data.component';
import { UserFilterComponent } from '../../../../shared/components/filters/user-filter/user-filter.component';
import { ReusableFilterBarComponent } from '../../../../shared/components/filter-bar/filter-bar.component';

// ==================== HELPERS ====================
import { getUserRole } from '../../../../core/helpers/auth.helpers';
import { PageTitleComponent } from '../../../../shared/components/page-title/page-title.component';

/**
 * User Management Component
 * - Handles listing users, pagination, filtering, CRUD actions
 * - Supports PDF & Excel export
 * - Designed as standalone component for modularity
 */
@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    UserCardsComponent,
    TableDataComponent,
    UserFilterComponent,
    ReusableFilterBarComponent,
    PageTitleComponent,
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent {
  // ==================== STATE & UI PROPERTIES ====================
  searchData: string = '';
  filterData: any = {};
  showFilterModal: boolean = false;

  // Pagination properties
  users: UserModel[] = [];
  currentPage: number = 1;
  pageSize: number | undefined = 5;
  totalPages: number = 1;
  totalCount: number = 0;
  currentUserRole: string = '';

  // Table configuration
  tableColumns: TableColumn[] = [
    { key: 'image', label: 'UserTABLE.USERS', type: 'image' },
    { key: 'phoneNumber', label: 'UserTABLE.PHONE', type: 'text' },
    { key: 'email', label: 'UserTABLE.EMAIL', type: 'text' },
    { key: 'idNumber', label: 'UserTABLE.ID_NUMBER', type: 'text' },
    { key: 'nationalityName', label: 'UserTABLE.NATIONALITY', type: 'text' },
    { key: 'role', label: 'UserTABLE.ROLE', type: 'text' },
  ];

  // Table actions with role-based conditions
  tableActions: TableAction[] = [
    {
      icon: 'fas fa-edit',
      label: 'actions.EDIT', // 🔑 translation key
      action: (user) => this.openEditModal(user),
      condition: (_, role) => role === 'Admin',
    },
    {
      icon: 'fas fa-eye',
      label: 'actions.VIEW_DETAILS', // 🔑 translation key
      action: (user) => this.navigateToUserDetails(user.id),
      condition: () => true,
    },
    {
      icon: 'fas fa-trash-alt',
      label: 'actions.DELETE', // 🔑 translation key
      action: (user) => this.deleteUser(user),
      condition: (_, role) => role === 'Admin',
    },
  ];

  // ==================== CONSTRUCTOR ====================
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  // ==================== LIFECYCLE ====================
  ngOnInit(): void {
    this.currentUserRole = getUserRole();
    this.handleRoleIdParam();
    this.loadPaginatedUsers();
  }

  // ==================== DATA LOADING ====================

  /**
   * Load users with current filters & pagination
   */
  loadPaginatedUsers(): void {
    const filters = this.buildFilters();
    this.userService.getUsersWithPagination(filters).subscribe((response) => {
      this.updateUserData(response.data);
    });
  }

  /**
   * Update component state with paginated data
   */
  private updateUserData(data: any): void {
    this.users = data.data;
    this.currentPage = data.currentPage;
    this.totalPages = data.totalPages;
    this.totalCount = data.totalCount;
    this.pageSize = data.pageSize;
  }

  // ==================== EVENT HANDLERS ====================

  onSearchChange(searchTerm: string): void {
    this.searchData = searchTerm;
    this.currentPage = 1;
    this.loadPaginatedUsers();
  }

  onFilterApplied(filterObj: any): void {
    this.filterData = { ...filterObj };
    this.currentPage = 1;
    this.loadPaginatedUsers();
    this.showFilterModal = false;
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadPaginatedUsers();
  }

  onPageSizeChange(size: number | undefined): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadPaginatedUsers();
  }

  // ==================== EXPORT & PRINT ====================

  downloadAsPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Name', 'Email', 'Phone', 'Role']],
      body: this.users.map((u) => [
        `${u.firstName} ${u.lastName}`,
        u.email,
        u.phoneNumber,
        u.role,
      ]),
    });
    doc.save('users.pdf');
  }

  downloadAsExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(
      this.users.map((u) => ({
        Name: `${u.firstName} ${u.lastName}`,
        Email: u.email,
        Phone: u.phoneNumber,
        Role: u.role,
        ID: u.idNumber,
        Nationality: u.nationalityName,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    FileSaver.saveAs(new Blob([buffer]), 'users.xlsx');
  }

  printPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Name', 'Email', 'Phone', 'Role']],
      body: this.users.map((u) => [
        `${u.firstName} ${u.lastName}`,
        u.email,
        u.phoneNumber,
        u.role,
      ]),
    });
    const pdfWindow = window.open(doc.output('bloburl'), '_blank');
    pdfWindow?.focus();
    pdfWindow?.print();
  }

  // ==================== USER ACTIONS ====================

  openEditModal(user: any): void {
    this.router.navigate(['admin', 'edit-user', user.id]);
  }

  navigateToUserDetails(id: any): void {
    this.router.navigate([`/${this.getBaseRouteByRole()}/user-details/${id}`]);
  }

  navigateToAddUser(): void {
    this.router.navigate(['/admin/add-user']);
  }

  navigateToDeletedUsers(): void {
    this.router.navigate(['admin', 'deleted-users']);
  }

  deleteUser(user: UserModel): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete user ${user.firstName} ${user.lastName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(user.id).subscribe(() => {
          this.showSuccess(`Deleted ${user.firstName} ${user.lastName}.`);
          this.loadPaginatedUsers();
        });
      }
    });
  }

  // ==================== HELPER METHODS ====================

  isAdmin(): boolean {
    return this.currentUserRole === 'Admin';
  }

  private handleRoleIdParam(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['roleId']) {
        const role = this.mapRoleId(params['roleId']);
        if (role) {
          this.onFilterApplied({ selectedRole: role });
        }
        // Remove roleId from URL
        this.router.navigate([], {
          queryParams: { roleId: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }
    });
  }

  private buildFilters(): any {
    const f = this.filterData;
    return {
      PageNumber: this.currentPage,
      PageSize: this.pageSize,
      Search: this.searchData || '',
      Nationality: f.selectedNationality,
      Country: f.selectedCountry,
      AreaId: f.selectedArea,
      CityId: f.selectedCity,
      RoleId: f.selectedRole ? +f.selectedRole : undefined,
      Gender: f.selectedGender,
      ProviderId: f.selectedProvider,
      OrganizationId: f.selectedOrganization,
      BuildingId: f.selectedBuilding,
      FloorId: f.selectedFloor,
      SectionId: f.selectedSection,
      PointId: f.selectedPoint,
    };
  }

  private showSuccess(message: string): void {
    Swal.fire({ icon: 'success', title: 'Success', text: message });
  }

  private getBaseRouteByRole(): string {
    const roles: Record<string, string> = {
      Admin: 'admin',
      Manager: 'manager',
      Supervisor: 'supervisor',
      Cleaner: 'cleaner',
    };
    return roles[this.currentUserRole] || 'admin';
  }

  private mapRoleId(roleId: string): string | undefined {
    const map: Record<string, string> = {
      '1': '1',
      '2': '2',
      '3': '3',
      '4': '4',
    };
    return map[roleId];
  }

  openFilterModal(): void {
    this.showFilterModal = true;
  }

  closeFilterModal(): void {
    this.showFilterModal = false;
  }
}
