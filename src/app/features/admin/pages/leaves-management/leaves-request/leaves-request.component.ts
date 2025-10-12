import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

// Components
import {
  TableDataComponent,
  TableColumn,
  TableAction,
} from '../../../../../shared/components/table-data/table-data.component';
import { ReusableFilterBarComponent } from '../../../../../shared/components/filter-bar/filter-bar.component';
import { PageTitleComponent } from '../../../../../shared/components/page-title/page-title.component';
import { LeavesFilterComponent } from '../../../../../shared/components/filters/leaves-filter/leaves-filter.component';
import { LeaveOffcanvasComponent } from '../leave-offcanvas/leave-offcanvas.component';
import Offcanvas from 'bootstrap/js/dist/offcanvas';

// Services
import { LeaveService } from '../../../services/leave.service';
import { UserService } from '../../../services/user.service';

// Models & Helpers
import { LeaveItem } from '../../../models/leave.model';
import { getUserRole } from '../../../../../core/helpers/auth.helpers';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-leaves-request',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TableDataComponent,
    ReusableFilterBarComponent,
    PageTitleComponent,
    LeavesFilterComponent,
    LeaveOffcanvasComponent,
  ],
  templateUrl: './leaves-request.component.html',
  styleUrls: ['./leaves-request.component.scss'],
})
export class LeavesRequestComponent {
  @ViewChild(LeaveOffcanvasComponent) leaveOffcanvas!: LeaveOffcanvasComponent;

  // Component State
  searchData: string = '';
  filterData: any = {};
  showFilterModal: boolean = false;
  selectedLeave: any = null;
  users: any[] = [];
  leaveRequests: LeaveItem[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  totalCount: number = 0;
  currentUserRole: string = '';
  isCleanerRole: boolean = false;
  // Table Configuration
  tableColumns: TableColumn[] = [
    { key: 'userName', label: 'LEAVE.USER', type: 'text' },
    { key: 'role', label: 'LEAVE.ROLE', type: 'text' },
    { key: 'startDate', label: 'LEAVE.START_DATE', type: 'date' },
    { key: 'endDate', label: 'LEAVE.END_DATE', type: 'date' },
    { key: 'type', label: 'LEAVE.TYPE', type: 'text' },
    { key: 'status', label: 'LEAVE.STATUS', type: 'text' },
  ];

  tableActions: TableAction[] = [
    {
      icon: 'fas fa-edit',
      label: 'actions.EDIT',
      condition: (item: any) => this.isAdmin() || item.status === 'Pending',
      action: (item: any) => this.editLeave(item),
    },
    {
      icon: 'fas fa-eye',
      label: 'actions.VIEW_DETAILS',
      condition: () => true,
      action: (item: any) => this.viewLeaveDetails(item),
    },
    {
      icon: 'fas fa-check-circle',
      label: 'actions.APPROVE',
      condition: () => this.isAdminOrManager(),
      action: (item: any) => this.approveLeave(item.id),
    },
    {
      icon: 'fas fa-times-circle',
      label: 'actions.REJECT',
      condition: () => this.isAdminOrManager(),
      action: (item: any) => this.rejectLeaveWithReason(item.id),
    },
    {
      icon: 'fas fa-trash-alt',
      label: 'actions.DELETE',
      condition: () => this.isAdmin(),
      action: (item: any) => this.deleteLeave(item),
    },
  ];

  constructor(
    private router: Router,
    private leaveService: LeaveService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.currentUserRole = getUserRole();
    this.isCleanerRole = this.currentUserRole.toLowerCase() === 'cleaner'; // NEW: Set cleaner flag

    this.loadLeaveRequests();

    // NEW: Only load users if not cleaner role
    if (!this.isCleanerRole) {
      this.loadUsers();
    }
  }

  // Data Loading Methods
  loadLeaveRequests(): void {
    const filters = this.buildFilters();
    this.leaveService.getLeavesWithPagination(filters).subscribe({
      next: (response) => {
        if (response?.succeeded) {
          // NEW: Add isCleaner flag to each leave item if user is cleaner
          const leaveData = response.data.data.map((item: any) => ({
            ...item,
            isCleaner: this.isCleanerRole, // Add the flag here
          }));

          this.updateLeaveData({
            ...response.data,
            data: leaveData,
          });
        } else {
          this.resetLeaveData();
        }
      },
    });
  }

  loadUsers(): void {
    // NEW: Don't load users if cleaner role
    if (this.isCleanerRole) {
      this.users = [];
      return;
    }

    const filters = {
      PageNumber: 1,
    };

    this.userService.getUsersWithPagination(filters).subscribe({
      next: (response) => {
        this.users = response.data?.data ?? [];
      },
    });
  }

  private updateLeaveData(data: any): void {
    this.leaveRequests = data.data;
    this.currentPage = data.currentPage;
    this.totalPages = data.totalPages;
    this.totalCount = data.totalCount;
    this.pageSize = data.pageSize;
  }

  private resetLeaveData(): void {
    this.leaveRequests = [];
    this.currentPage = 1;
    this.totalPages = 1;
    this.totalCount = 0;
  }

  // UI Interaction Methods
  openAddLeaveOffcanvas(): void {
    this.selectedLeave = null;
    this.leaveOffcanvas.resetForm();

    const offcanvasElement = document.getElementById('leaveOffcanvas');
    if (offcanvasElement) {
      const offcanvas = new Offcanvas(offcanvasElement);
      offcanvas.show();
    }
  }

  editLeave(item: LeaveItem): void {
    this.selectedLeave = item;
    const offcanvasElement = document.getElementById('leaveOffcanvas');
    if (offcanvasElement) {
      const offcanvas = new Offcanvas(offcanvasElement);
      offcanvas.show();
    }
  }

  handleLeaveUpdated(): void {
    this.loadLeaveRequests();
    this.selectedLeave = null;
  }

  viewLeaveDetails(item: LeaveItem): void {
    this.router.navigate(
      [`/${this.getBaseRouteByRole()}/leave-details/${item.id}`],
      {
        state: { leaveData: item },
      }
    );
  }

  deleteLeave(item: LeaveItem): void {
    Swal.fire({
      title: 'Delete Leave',
      text: 'Are you sure you want to delete this leave request?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.leaveService.deleteLeave(item.id).subscribe({
          next: () => {
            this.showSuccess('Leave request deleted successfully');
            this.loadLeaveRequests();
          },
        });
      }
    });
  }

  // Filter Methods
  onSearchChange(searchTerm: string): void {
    this.searchData = searchTerm;
    this.currentPage = 1;
    this.loadLeaveRequests();
  }

  onFilterApplied(filterObj: any): void {
    this.filterData = { ...filterObj };
    this.currentPage = 1;
    this.loadLeaveRequests();
    this.showFilterModal = false;
  }

  openFilterModal(): void {
    // NEW: Don't show filter modal for cleaner role if it contains user selection
    if (this.isCleanerRole) {
      // You might want to show a message or handle differently
      console.log('Filter options limited for cleaner role');
      return;
    }
    this.showFilterModal = true;
  }

  closeFilterModal(): void {
    this.showFilterModal = false;
  }

  // Pagination Methods
  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadLeaveRequests();
  }

  onPageSizeChange(size: number | undefined): void {
    this.pageSize = size || 10;
    this.currentPage = 1;
    this.loadLeaveRequests();
  }

  // Add these new methods to the component class
  approveLeave(id: number): void {
    Swal.fire({
      title: 'Approve Leave',
      text: 'Are you sure you want to approve this leave request?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Approve',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.leaveService.approveLeave(id).subscribe({
          next: (response) => {
            if (response?.succeeded) {
              this.showSuccess('Leave request approved successfully');
              this.loadLeaveRequests();
            }
          },
        });
      }
    });
  }

  rejectLeaveWithReason(id: number): void {
    Swal.fire({
      title: 'Reject Leave',
      html: `
      <p>Are you sure you want to reject this leave request?</p>
      <input id="rejectionReason" class="swal2-input" placeholder="Rejection reason">
    `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Reject',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const reason = (
          document.getElementById('rejectionReason') as HTMLInputElement
        ).value;
        if (!reason) {
          Swal.showValidationMessage('Please enter a rejection reason');
          return false;
        }
        return reason;
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.leaveService.rejectLeave(id, result.value).subscribe({
          next: (response) => {
            if (response?.succeeded) {
              this.showSuccess('Leave request rejected successfully');
              this.loadLeaveRequests();
            }
          },
        });
      }
    });
  }

  // Export Methods
  downloadAsPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        ['User', 'Role', 'Start Date', 'End Date', 'Type', 'Status', 'Reason'],
      ],
      body: this.leaveRequests.map((item) => [
        item.userName,
        item.role,
        item.startDate,
        item.endDate,
        item.type,
        item.status,
        item.reason,
      ]),
    });
    doc.save('leave_requests.pdf');
  }

  downloadAsExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(
      this.leaveRequests.map((item) => ({
        User: item.userName,
        Role: item.role,
        'Start Date': item.startDate,
        'End Date': item.endDate,
        Type: item.type,
        Status: item.status,
        Reason: item.reason,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leave Requests');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    FileSaver.saveAs(new Blob([buffer]), 'leave_requests.xlsx');
  }

  printPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        ['User', 'Role', 'Start Date', 'End Date', 'Type', 'Status', 'Reason'],
      ],
      body: this.leaveRequests.map((item) => [
        item.userName,
        item.role,
        item.startDate,
        item.endDate,
        item.type,
        item.status,
        item.reason,
      ]),
    });
    const pdfWindow = window.open(doc.output('bloburl'), '_blank');
    pdfWindow?.focus();
    pdfWindow?.print();
  }

  // Helper Methods
  private buildFilters(): any {
    const filters: any = {
      PageNumber: this.currentPage,
      PageSize: this.pageSize,
      Search: this.searchData || '',
      StartDate: this.filterData.startDate,
      EndDate: this.filterData.endDate,
      Status: this.filterData.selectedStatus,
      Type: this.filterData.selectedType,
      History: this.isCleanerRole, // Set to true for cleaner, false for others
    };

    // Only include user-related filters if not cleaner role
    if (!this.isCleanerRole) {
      filters.UserId = this.filterData.selectedUser;
      filters.RoleId = this.filterData.selectedRole;
      filters.AreaId = this.filterData.selectedArea;
      filters.CityId = this.filterData.selectedCity;
      filters.OrganizationId = this.filterData.selectedOrganization;
      filters.BuildingId = this.filterData.selectedBuilding;
      filters.FloorId = this.filterData.selectedFloor;
      filters.SectionId = this.filterData.selectedSection;
      filters.PointId = this.filterData.selectedPoint;
      filters.ProviderId = this.filterData.selectedProvider;
    }

    return filters;
  }

  isAdminOrManager(): boolean {
    const rolesToCheck = ['admin', 'manager', 'supervisor'];
    return rolesToCheck.includes(this.currentUserRole.toLowerCase());
  }

  isAdmin(): boolean {
    return this.currentUserRole.toLowerCase() === 'admin';
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

  private showSuccess(message: string): void {
    Swal.fire({ icon: 'success', title: 'Success', text: message });
  }

  // NEW: Method to handle leave creation using createLeaveRequest
  createLeaveRequest(
    startDate: string,
    endDate: string,
    type: number,
    reason: string,
    file?: File
  ): Observable<any> {
    return this.leaveService.createLeaveRequest(
      startDate,
      endDate,
      type,
      reason,
      file
    );
  }

  // NEW: Method to handle leave editing using editLeaveRequest
  editLeaveRequest(
    id: number,
    startDate: string,
    endDate: string,
    type: number,
    reason: string,
    file?: File
  ): Observable<any> {
    return this.leaveService.editLeaveRequest(
      id,
      startDate,
      endDate,
      type,
      reason,
      file
    );
  }
}
