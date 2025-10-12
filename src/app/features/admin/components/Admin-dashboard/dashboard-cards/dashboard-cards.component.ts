import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AdminDashboardService } from '../../../services/admin-dashboard.service';

@Component({
  selector: 'app-dashboard-cards',
  imports: [CommonModule, TranslateModule],
  templateUrl: './dashboard-cards.component.html',
  styleUrl: './dashboard-cards.component.scss',
})
export class DashboardCardsComponent implements OnInit {
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

  stockData = {
    currentMonthTotal: 0,
    percentageChange: 0,
    selectedMonth: new Date().getMonth() + 1, // Default to current month
  };

  materialsData = {
    count: 0,
    percentage: 0,
  };

  shiftsData = {
    totalCount: 0,
    activeCount: 0,
    inactiveCount: 0,
    activePercentage: 0,
  };

  constructor(
    private dashboardService: AdminDashboardService,
    private router: Router // Inject Router
  ) {}

  ngOnInit(): void {
    this.fetchUserCount();
    this.fetchStockPriceTotal();
    this.fetchMaterialsUnderCount();
    this.fetchActiveShiftsCount();
  }

  fetchUserCount(): void {
    this.dashboardService.getUsersCount().subscribe({
      next: (response) => {
        if (response.success) {
          this.userData = {
            total: response.total || 0,
            labels: response.labels || [],
            values: response.values || [],
          };
        } else {
          console.warn('Failed to fetch user count');
          this.userData = { total: 0, labels: [], values: [] };
        }
      },
      error: (err) => {
        console.error('Error fetching user count:', err);
        this.userData = { total: 0, labels: [], values: [] };
      },
    });
  }

  fetchStockPriceTotal(): void {
    this.dashboardService
      .getStockPriceTotal(this.stockData.selectedMonth)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.stockData.currentMonthTotal = response.currentMonthTotal || 0;
            this.stockData.percentageChange = response.percentageChange || 0;
          } else {
            console.warn('Failed to fetch stock price total');
            this.stockData.currentMonthTotal = 0;
            this.stockData.percentageChange = 0;
          }
        },
        error: (err) => {
          console.error('Error fetching stock price total:', err);
          this.stockData.currentMonthTotal = 0;
          this.stockData.percentageChange = 0;
        },
      });
  }

  fetchMaterialsUnderCount(): void {
    this.dashboardService.getMaterialsUnderCount().subscribe({
      next: (response) => {
        if (response.success) {
          this.materialsData = {
            count: response.count || 0,
            percentage: response.percentage || 0,
          };
        } else {
          console.warn('Failed to fetch materials under count');
          this.materialsData = { count: 0, percentage: 0 };
        }
      },
      error: (err) => {
        console.error('Error fetching materials under count:', err);
        this.materialsData = { count: 0, percentage: 0 };
      },
    });
  }

  fetchActiveShiftsCount(): void {
    this.dashboardService.getActiveShiftsCount().subscribe({
      next: (response) => {
        if (response.success) {
          this.shiftsData = {
            totalCount: response.totalCount || 0,
            activeCount: response.activeCount || 0,
            inactiveCount: response.inactiveCount || 0,
            activePercentage: response.activePercentage || 0,
          };
        } else {
          console.warn('Failed to fetch active shifts count');
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
    this.stockData.selectedMonth = parseInt(selectElement.value);
    this.fetchStockPriceTotal();
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
    this.router.navigate(['/admin/user-management'], {
      queryParams: { roleId },
    });
  }
}
