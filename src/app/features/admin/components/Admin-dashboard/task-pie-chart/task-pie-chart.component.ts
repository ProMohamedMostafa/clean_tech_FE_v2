import { Component, OnInit } from '@angular/core';
import {
  ChartConfiguration,
  ChartData,
  ChartType,
  ChartEvent,
  ActiveElement,
} from 'chart.js';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TaskService } from '../../../../../shared/services/task.service';
import { UserService } from '../../../services/user.service';
import { getUserRole } from '../../../../../core/helpers/auth.helpers';

@Component({
  selector: 'app-task-pie-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule, FormsModule, TranslateModule],
  templateUrl: './task-pie-chart.component.html',
  styleUrls: ['./task-pie-chart.component.css'],
})
export class TaskPieChartComponent implements OnInit {
  // Enhanced status value mapping that handles both formats
  private statusValueMap: { [key: string]: number } = {
    Pending: 0,
    InProgress: 1,
    'In Progress': 1,
    WaitingForApproval: 2,
    'Waiting For Approval': 2,
    Completed: 3,
    Rejected: 4,
    NotResolved: 5,
    'Not Resolved': 5,
    Overdue: 6,
  };

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event: ChartEvent, elements: ActiveElement[]) => {
      if (elements.length > 0) {
        this.handleChartClick(elements[0]);
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        onClick: (e: ChartEvent, legendItem: any, legend: any) => {
          const label = this.chartData.labels?.[
            legendItem.datasetIndex
          ] as string;
        },
      },
      title: {
        display: true,
        text: 'Task Distribution by Status',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = Number(context.parsed) || 0;
            const dataset = context.dataset.data;
            const total = dataset.reduce<number>(
              (sum: number, current: unknown) => {
                const num = Number(current) || 0;
                return sum + num;
              },
              0
            );
            const percentage =
              total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  public chartData: ChartData = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#FFC107', // Pending
          '#2196F3', // InProgress
          '#9C27B0', // WaitingForApproval
          '#4CAF50', // Completed
          '#F44336', // Rejected
          '#607D8B', // NotResolved
          '#FF5722', // Overdue
        ],
        hoverBackgroundColor: [
          '#FFD54F',
          '#42A5F5',
          '#AB47BC',
          '#66BB6A',
          '#EF5350',
          '#78909C',
          '#FF7043',
        ],
        borderWidth: 1,
        hoverBorderWidth: 2,
      },
    ],
  };

  public chartType: ChartType = 'doughnut';

  public availableChartTypes: { key: ChartType; label: string }[] = [
    { key: 'pie', label: 'dashboard.PIE' },
    { key: 'bar', label: 'dashboard.BAR' },
    { key: 'line', label: 'dashboard.LINE' },
    { key: 'polarArea', label: 'dashboard.POLAR_AREA' },
    { key: 'doughnut', label: 'dashboard.DOUGHNUT' },
  ];

  public selectedChartType: ChartType = 'doughnut';

  public selectedPeriod?: number | 'current' = undefined;
  public currentYear = new Date().getFullYear();
  public selectedYear?: number | null = null;
  public selectedUserId?: number;
  public users: any[] = [];
  public isLoading: boolean = false;
  public errorMessage: string | null = null;

  constructor(
    private taskService: TaskService,
    private userManagementService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
    this.fetchData();
  }

  private handleChartClick(element: ActiveElement): void {
    if (element && this.chartData.labels && element.index !== undefined) {
      let statusLabel = this.chartData.labels[element.index] as string;
      console.log('Clicked label:', statusLabel); // Debug log

      // Map status label to value
      let statusValue = this.statusValueMap[statusLabel];

      // Try removing spaces if no exact match (backward compatibility)
      if (statusValue === undefined) {
        const normalizedLabel = statusLabel.replace(/\s+/g, '');
        statusValue = this.statusValueMap[normalizedLabel];
      }

      if (statusValue !== undefined) {
        console.log('Navigating with status:', statusValue); // Debug log

        const userRole = getUserRole() || '';

        // Map roles to base routes
        const roleRoutes: { [key: string]: string } = {
          Admin: 'admin',
          Manager: 'manager',
          Supervisor: 'supervisor',
          Cleaner: 'cleaner',
        };

        const baseRoute = roleRoutes[userRole] || 'admin';

        // Use 'received-tasks' for Manager, Supervisor, Cleaner
        const taskRoute =
          userRole === 'Manager' ||
          userRole === 'Supervisor' ||
          userRole === 'Cleaner'
            ? 'my-tasks'
            : 'tasks';

        this.router.navigate([`/${baseRoute}/${taskRoute}`], {
          queryParams: {
            status: statusValue,
            ...(this.selectedYear && { year: this.selectedYear }),
            ...(this.selectedUserId && { userId: this.selectedUserId }),
          },
        });
      } else {
        console.warn('No status mapping found for label:', statusLabel);
      }
    }
  }

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

  fetchData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    let startDate: string | undefined = undefined;
    let endDate: string | undefined = undefined;

    // Only set dates if user selects a year or period
    if (this.selectedYear) {
      startDate = `${this.selectedYear}-01-01`;
      endDate = `${this.selectedYear}-12-31`;
    } else if (typeof this.selectedPeriod === 'number') {
      const startDateObj = new Date();
      startDateObj.setMonth(startDateObj.getMonth() - this.selectedPeriod);
      startDate = startDateObj.toISOString().split('T')[0];
      endDate = new Date().toISOString().split('T')[0];
    }
    // If no year or period is selected, startDate & endDate remain undefined
    // and API should return all tasks

    const userId = this.selectedUserId ?? null;

    this.taskService.getStatusSummary(userId, startDate, endDate).subscribe({
      next: (data) => {
        this.updateChartData(data);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Error fetching task status data';
        this.isLoading = false;
        console.error('Error fetching task status data:', err);

        this.updateChartData({
          labels: [],
          values: [],
        });
      },
    });
  }

  private updateChartData(data: any): void {
    // Format labels to consistent format
    const formattedLabels = data.labels.map((label: string) => {
      switch (label) {
        case 'InProgress':
          return 'In Progress';
        case 'WaitingForApproval':
          return 'Waiting For Approval';
        case 'NotResolved':
          return 'Not Resolved';
        default:
          return label;
      }
    });

    this.chartData = {
      labels: formattedLabels,
      datasets: [
        {
          data: data.values,
          backgroundColor: [
            '#FFC107',
            '#2196F3',
            '#9C27B0',
            '#4CAF50',
            '#F44336',
            '#607D8B',
            '#FF5722',
          ],
          hoverBackgroundColor: [
            '#FFD54F',
            '#42A5F5',
            '#AB47BC',
            '#66BB6A',
            '#EF5350',
            '#78909C',
            '#FF7043',
          ],
          borderWidth: 1,
          hoverBorderWidth: 2,
        },
      ],
    };
  }

  onPeriodChange(selectElement: EventTarget | null): void {
    if (!selectElement) return;
    const target = selectElement as HTMLSelectElement;
    this.selectedPeriod =
      target.value === 'current' ? 'current' : parseInt(target.value);
    this.fetchData();
  }

  onYearChange(year?: number): void {
    this.selectedYear = year;
    this.fetchData();
  }

  onUserChange(userId?: number): void {
    this.selectedUserId = userId;
    this.fetchData();
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
}
