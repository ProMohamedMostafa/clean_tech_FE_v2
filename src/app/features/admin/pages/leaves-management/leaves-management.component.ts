import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { ChartType, NgApexchartsModule } from 'ng-apexcharts';

// Components
import {
  TableDataComponent,
  TableColumn,
  TableAction,
} from '../../../../shared/components/table-data/table-data.component';
import { ReusableFilterBarComponent } from '../../../../shared/components/filter-bar/filter-bar.component';
import { PageTitleComponent } from '../../../../shared/components/page-title/page-title.component';
import { LeavesFilterComponent } from '../../../../shared/components/filters/leaves-filter/leaves-filter.component';
import { LeaveOffcanvasComponent } from './leave-offcanvas/leave-offcanvas.component';
import Offcanvas from 'bootstrap/js/dist/offcanvas';

// Services
import { LeaveService } from '../../services/leave.service';
import { UserService } from '../../services/user.service';

// Models & Helpers
import { LeaveItem } from '../../models/leave.model';
import { getUserRole } from '../../../../core/helpers/auth.helpers';

@Component({
  selector: 'app-leaves-management',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TableDataComponent,
    ReusableFilterBarComponent,
    PageTitleComponent,
    LeavesFilterComponent,
    NgApexchartsModule,
    LeaveOffcanvasComponent,
  ],
  templateUrl: './leaves-management.component.html',
  styleUrls: ['./leaves-management.component.scss'],
})
export class LeavesManagementComponent {
  @ViewChild(LeaveOffcanvasComponent) leaveOffcanvas!: LeaveOffcanvasComponent;

  // Chart Configuration
  chartOptions: {
    series: ApexAxisChartSeries;
    chart: ApexChart & { type: ChartType };
    xaxis: ApexXAxis;
    dataLabels: ApexDataLabels;
    title: ApexTitleSubtitle;
    yaxis: ApexYAxis;
  };

  // Component State
  searchData: string = '';
  filterData: any = {};
  showFilterModal: boolean = false;
  selectedLeave: any = null;
  users: any[] = [];
  leaveHistory: LeaveItem[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  totalCount: number = 0;
  currentUserRole: string = '';

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
      label: 'actions.EDIT', // 🔑 translation key
      condition: (item: any) =>
        this.isAdminOrManager() || item.status === 'Pending',
      action: (item: any) => this.editLeave(item),
    },
    {
      icon: 'fas fa-eye',
      label: 'actions.VIEW_DETAILS', // 🔑 translation key
      condition: () => true,
      action: (item: any) => this.viewLeaveDetails(item),
    },
    {
      icon: 'fas fa-trash-alt',
      label: 'actions.DELETE', // 🔑 translation key
      condition: (item: any) => this.isAdminOrManager(),
      action: (item: any) => this.deleteLeave(item),
    },
  ];

  constructor(
    private router: Router,
    private leaveService: LeaveService,
    private userService: UserService
  ) {
    // Initialize chart options
    this.chartOptions = {
      series: [
        {
          name: 'Leaves',
          data: [],
        },
      ],
      chart: {
        type: 'bar',
        height: 350,
        stacked: true,
      },
      title: {
        text: 'Monthly Leaves Statistics',
      },
      xaxis: {
        categories: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ],
      },
      dataLabels: {
        enabled: true,
      },
      yaxis: {
        title: {
          text: 'Number of Leaves',
        },
      },
    };
  }

  ngOnInit(): void {
    this.currentUserRole = getUserRole();
    this.loadLeaveHistory();
    this.loadUsers();
  }

  isAdmin(): boolean {
    return this.currentUserRole === 'Admin';
  }

  // Data Loading Methods
  loadLeaveHistory(): void {
    const filters = this.buildFilters();
    this.leaveService.getLeavesWithPagination(filters).subscribe({
      next: (response) => {
        if (response?.succeeded) {
          this.updateLeaveData(response.data);
        } else {
          this.resetLeaveData();
        }
      },
    });
  }

  loadUsers(): void {
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
    this.leaveHistory = data.data;
    this.currentPage = data.currentPage;
    this.totalPages = data.totalPages;
    this.totalCount = data.totalCount;
    this.pageSize = data.pageSize;
    this.updateChartData(this.leaveHistory);
  }

  private resetLeaveData(): void {
    this.leaveHistory = [];
    this.currentPage = 1;
    this.totalPages = 1;
    this.totalCount = 0;
  }

  private updateChartData(leaves: LeaveItem[]): void {
    const monthlyLeaveCounts = new Array(12).fill(0);
    leaves.forEach((leave) => {
      const month = new Date(leave.startDate).getMonth();
      monthlyLeaveCounts[month]++;
    });
    this.chartOptions.series = [
      {
        name: 'Leaves',
        data: monthlyLeaveCounts,
      },
    ];
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
    this.loadLeaveHistory();
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
            this.showSuccess('Leave deleted successfully');
            this.loadLeaveHistory();
          },
        });
      }
    });
  }

  // Filter Methods
  onSearchChange(searchTerm: string): void {
    this.searchData = searchTerm;
    this.currentPage = 1;
    this.loadLeaveHistory();
  }

  onFilterApplied(filterObj: any): void {
    this.filterData = { ...filterObj };
    this.currentPage = 1;
    this.loadLeaveHistory();
    this.showFilterModal = false;
  }

  openFilterModal(): void {
    this.showFilterModal = true;
  }

  closeFilterModal(): void {
    this.showFilterModal = false;
  }

  // Pagination Methods
  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadLeaveHistory();
  }

  onPageSizeChange(size: number | undefined): void {
    this.pageSize = size || 10;
    this.currentPage = 1;
    this.loadLeaveHistory();
  }

  // Export Methods
  downloadAsPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        ['User', 'Role', 'Start Date', 'End Date', 'Type', 'Status', 'Reason'],
      ],
      body: this.leaveHistory.map((item) => [
        item.userName,
        item.role,
        item.startDate,
        item.endDate,
        item.type,
        item.status,
        item.reason,
      ]),
    });
    doc.save('leave_history.pdf');
  }

  downloadAsExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(
      this.leaveHistory.map((item) => ({
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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leave History');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    FileSaver.saveAs(new Blob([buffer]), 'leave_history.xlsx');
  }

  printPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        ['User', 'Role', 'Start Date', 'End Date', 'Type', 'Status', 'Reason'],
      ],
      body: this.leaveHistory.map((item) => [
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
    return {
      PageNumber: this.currentPage,
      PageSize: this.pageSize,
      Search: this.searchData || '',
      UserId: this.filterData.selectedUser,
      StartDate: this.filterData.dateFrom, // Changed from startDate to dateFrom
      EndDate: this.filterData.dateTo, // Changed from endDate to dateTo
      Status: this.filterData.selectedStatus,
      Type: this.filterData.selectedType,
      RoleId: this.filterData.selectedRole,
      AreaId: this.filterData.selectedArea,
      CityId: this.filterData.selectedCity,
      OrganizationId: this.filterData.selectedOrganization,
      BuildingId: this.filterData.selectedBuilding,
      FloorId: this.filterData.selectedFloor,
      SectionId: this.filterData.selectedSection,
      PointId: this.filterData.selectedPoint,
      ProviderId: this.filterData.selectedProvider,
      History: false,
    };
  }

  isAdminOrManager(): boolean {
    return ['Admin', 'Manager'].includes(this.currentUserRole);
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
}
