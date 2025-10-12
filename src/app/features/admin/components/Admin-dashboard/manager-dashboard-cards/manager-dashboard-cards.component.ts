import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminDashboardService } from '../../../services/admin-dashboard.service';
import { TaskService } from '../../../../../shared/services/task.service';
import {
  getUserId,
  getUserRole,
} from '../../../../../core/helpers/auth.helpers';

@Component({
  selector: 'app-manager-dashboard-cards',
  imports: [CommonModule],
  templateUrl: './manager-dashboard-cards.component.html',
  styleUrl: './manager-dashboard-cards.component.css',
})
export class ManagerDashboardCardsComponent {
  userRole: string = '';
  selectedPriority: number = 0; // Default to Low priority

  monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  userData = {
    total: 0,
    labels: [] as string[],
    values: [] as number[],
  };

  attendanceData = {
    presentCount: 0,
    absentCount: 0,
    leavesCount: 0,
    selectedMonth: new Date().getMonth() + 1, // Default to current month
  };

  taskStatusData = {
    pending: 0,
    inProgress: 0,
    complete: 0,
    notResolved: 0,
  };

  shiftsData = {
    totalCount: 0,
    activeCount: 0,
    inactiveCount: 0,
    activePercentage: 0,
  };

  constructor(
    private dashboardService: AdminDashboardService,
    private taskService: TaskService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userRole = getUserRole().toLowerCase() || '';
    this.fetchAttendanceStatus();
    this.fetchTaskStatusData();
    this.fetchActiveShiftsCount();
    this.fetchUserCount();
  }

  fetchUserCount(): void {
    // Skip loading if the role is 'cleaner'
    if (this.userRole === 'cleaner') {
      console.log('User role is cleaner, skipping user count fetch.');
      this.userData = { total: 0, labels: [], values: [] }; // optional default
      return;
    }

    this.dashboardService.getUsersCount().subscribe({
      next: (response) => {
        if (response.success) {
          this.userData = {
            total: response.total || 0,
            labels: response.labels || [],
            values: response.values || [],
          };
        } else {
          console.warn('User count request failed');
          this.userData = { total: 0, labels: [], values: [] };
        }
      },
      error: (err) => {
        console.error('Error fetching user count:', err);
        this.userData = { total: 0, labels: [], values: [] };
      },
    });
  }

  fetchAttendanceStatus(): void {
    const selectedMonth =
      this.attendanceData.selectedMonth || new Date().getMonth() + 1;
    const day = 1;

    this.taskService.getAttendanceStatusCount(day, selectedMonth).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          const labels = response.data.labels;
          const values = response.data.values;

          this.attendanceData = {
            presentCount: values[labels.indexOf('Present')] || 0,
            absentCount: values[labels.indexOf('Absent')] || 0,
            leavesCount: values[labels.indexOf('Leaves')] || 0,
            selectedMonth,
          };
        }
      },
      error: (err) => {
        console.error('Error fetching attendance status:', err);
      },
    });
  }

  fetchActiveShiftsCount(): void {
    this.dashboardService.getActiveShiftsCount().subscribe({
      next: (response) => {
        if (response.success) {
          // The service returns { count: number | null; success: boolean }
          // This only gives you the active count, not the detailed breakdown
          const activeCount = response.totalCount || 0;

          // You'll need additional API calls to get the other data
          this.shiftsData = {
            totalCount: activeCount, // This might not be accurate - need total shifts endpoint
            activeCount: activeCount,
            inactiveCount: 0, // Need inactive shifts endpoint
            activePercentage: 100, // Need calculation based on total vs active
          };
        } else {
          console.warn('Active shifts count request failed');
          this.shiftsData = {
            totalCount: 0,
            activeCount: 0,
            inactiveCount: 0,
            activePercentage: 0,
          };
        }
      },
      error: (err) => {
        console.error('Error fetching active shifts count:', err);
        this.shiftsData = {
          totalCount: 0,
          activeCount: 0,
          inactiveCount: 0,
          activePercentage: 0,
        };
      },
    });
  }

  onMonthChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.attendanceData.selectedMonth = parseInt(selectElement.value);
    this.fetchAttendanceStatus();
  }

  getRoleValue(role: string): number {
    const index = this.userData.labels.indexOf(role);
    return index !== -1 ? this.userData.values[index] : 0;
  }

  formatCurrency(value: number): string {
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + ' K';
    }
    return value.toString();
  }

  navigateToUserManagement(roleId: number): void {
    const userRole = getUserRole() || '';

    // Create route mapping for different roles
    const roleRoutes: { [key: string]: string } = {
      Admin: 'admin',
      Manager: 'manager',
      Supervisor: 'supervisor',
      Cleaner: 'cleaner',
    };

    const baseRoute = roleRoutes[userRole] || 'admin'; // Default to 'admin' if role not found
    this.router.navigate([`/${baseRoute}/user-management`], {
      queryParams: { roleId },
    });
  }
  fetchTaskStatusData(): void {
    // You need to provide required parameters: userId, startDate, endDate
    // If you don't have these values, you'll need to handle them appropriately
    const userId = null;
    // Replace with actual user ID or default value
    const startDate = ''; // Replace with actual start date or default value
    const endDate = ''; // Replace with actual end date or default value

    this.taskService
      .getStatusSummary(userId, startDate, endDate, this.selectedPriority)
      .subscribe({
        next: (response) => {
          // The service returns the data directly, not wrapped in a response object
          const labels = response?.labels || [];
          const values = response?.values || [];

          const getCount = (label: string) => {
            const index = labels.indexOf(label);
            return index !== -1 ? values[index] : 0;
          };

          this.taskStatusData = {
            pending: getCount('Pending'),
            inProgress: getCount('InProgress'),
            complete: getCount('Completed'),
            notResolved: getCount('NotResolved'),
          };
        },
        error: (err) => {
          console.error('Error fetching task status data:', err);
          this.taskStatusData = {
            pending: 0,
            inProgress: 0,
            complete: 0,
            notResolved: 0,
          };
        },
      });
  }

  onPriorityChange(event: Event): void {
    this.selectedPriority = +(event.target as HTMLSelectElement).value;
    this.fetchTaskStatusData();
  }
}
