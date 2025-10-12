import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AdminDashboardService } from '../../../services/admin-dashboard.service';
import { UserService } from '../../../services/user.service';
import { Router } from '@angular/router'; // Add Router import
import { getUserRole } from '../../../../../core/helpers/auth.helpers';

@Component({
  selector: 'app-task-completion-rate',
  standalone: true,
  imports: [NgChartsModule, FormsModule, TranslateModule],
  templateUrl: './task-completion-rate.component.html',
  styleUrls: ['./task-completion-rate.component.css'],
})
export class TaskCompletionRateComponent implements OnInit {
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Completion Rate (%)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Months',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => context.parsed.y + '%',
        },
      },
    },
    // Add onClick event handler
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const elementIndex = elements[0].index;
        this.onChartClick(elementIndex);
      }
    },
  };

  public barChartType: ChartType = 'bar';
  public barChartData!: ChartData<'bar'>;

  // New properties
  public selectedChartType: ChartType = 'bar'; // Default
  public timePeriods = [
    { label: 'dashboard.LAST_6_MONTHS', value: 6 },
    { label: 'dashboard.LAST_12_MONTHS', value: 12 },
    { label: 'dashboard.THIS_YEAR', value: 'current' },
  ];

  public selectedPeriod = this.timePeriods[0].value;
  public currentYear = new Date().getFullYear();
  public selectedYear?: number;
  public selectedUserId?: number;
  users: any['data'] = [];

  // Store API data for reference
  private apiData: any = {};

  constructor(
    private dashboardService: AdminDashboardService,
    private userManagementService: UserService,
    private router: Router // Inject Router
  ) {}

  ngOnInit(): void {
    this.fetchTaskCompletionData();
    this.fetchUsers();
  }

  // Add this method if you need to fetch users
  fetchUsers(): void {
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

  fetchTaskCompletionData(): void {
    const filters = {
      ...(this.selectedYear && { Year: this.selectedYear }),
      ...(this.selectedUserId && { UserId: this.selectedUserId }),
    };

    this.dashboardService.getTasksCompletion(filters).subscribe({
      next: (data) => {
        if (data && data.labels && data.values) {
          this.apiData = data; // Store the API data
          this.processChartData(data);
        } else {
          console.warn('No valid task completion data available');
          this.processChartData({ labels: [], values: [] });
        }
      },
      error: (err) => {
        console.error('Error fetching task completion data:', err);
      },
    });
  }

  processChartData(apiData: any): void {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    let monthCount =
      typeof this.selectedPeriod === 'number'
        ? this.selectedPeriod
        : currentMonth + 1;

    const filteredLabels = [];
    const filteredValues = [];

    for (let i = 0; i < monthCount; i++) {
      const monthIndex = (currentMonth - monthCount + 1 + i + 12) % 12;
      filteredLabels.push(this.getShortMonthName(monthIndex));
      filteredValues.push(apiData.values[monthIndex] || 0);
    }

    this.barChartData = {
      labels: filteredLabels,
      datasets: [
        {
          label: 'Completion Rate (%)',
          data: filteredValues,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  }

  getShortMonthName(monthIndex: number): string {
    const months = [
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
    ];
    return months[monthIndex];
  }

  onPeriodChange(selectElement: EventTarget | null): void {
    if (!selectElement) return;
    const target = selectElement as HTMLSelectElement;
    this.selectedPeriod =
      target.value === 'current' ? 'current' : parseInt(target.value);
    this.fetchTaskCompletionData();
  }

  onYearChange(year?: number): void {
    this.selectedYear = year;
    this.fetchTaskCompletionData();
  }

  onUserChange(userId?: number): void {
    this.selectedUserId = userId;
    this.fetchTaskCompletionData();
  }

  onChartTypeChange(): void {
    this.barChartType = this.selectedChartType;
  }

  // New method: Handle chart click
  onChartClick(elementIndex: number): void {
    // Get the actual month index from the API data
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    let monthCount =
      typeof this.selectedPeriod === 'number'
        ? this.selectedPeriod
        : currentMonth + 1;

    const monthIndex = (currentMonth - monthCount + 1 + elementIndex + 12) % 12;

    // Get the completion rate value
    const completionRate = this.apiData.values[monthIndex] || 0;

    // Only navigate if there's data for this month
    if (completionRate > 0) {
      this.navigateToTaskManagement(monthIndex);
    }
  }

  // Navigate to task management with filters
  private navigateToTaskManagement(monthIndex: number): void {
    // Month names
    const monthNames = [
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

    const monthName = monthNames[monthIndex];
    const year = this.selectedYear || new Date().getFullYear();

    // Dates
    const startDate = new Date(year, monthIndex, 1);
    const endDate = new Date(year, monthIndex + 1, 0);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    // Query params
    const queryParams: any = {
      status: 3, // Completed status
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    };

    if (this.selectedUserId) {
      queryParams.userId = this.selectedUserId;
    }

    // Get role
    const role = getUserRole().toLowerCase();

    // Route based on role
    if (role === 'admin') {
      this.router.navigate(['/admin/tasks'], { queryParams });
    } else {
      this.router.navigate([`/${role}/my-tasks`], { queryParams });
    }
  }
}
