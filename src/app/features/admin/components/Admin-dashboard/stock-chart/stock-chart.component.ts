import { Component, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

import { TranslateModule } from '@ngx-translate/core';
import { AdminDashboardService } from '../../../services/admin-dashboard.service';
import { ProviderService } from '../../../services/provider.service';

@Component({
  selector: 'app-stock-chart',
  standalone: true,
  imports: [NgChartsModule, FormsModule, TranslateModule],
  templateUrl: './stock-chart.component.html',
  styleUrls: ['./stock-chart.component.scss'],
})
export class StockChartComponent implements OnInit {
  constructor(
    private adminDashboardService: AdminDashboardService,
    private providerService: ProviderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.generateYears();
    this.loadStockData();
    this.fetchProviders();
    this.onChartTypeChange();
  }

  // Filter properties
  selectedYear: number | null = null;
  selectedProviderId: number | null = null;
  years: number[] = [];
  yearsRange: number = 5;
  providers: { id: number; name: string }[] = [];
  loadingProviders: boolean = false;
  providerPageNumber: number = 1;
  providerPageSize: number = 10;
  hasMoreProviders: boolean = true;
  selectedChartType: ChartType = 'bar';

  // Chart configuration
  public lineChartData: ChartConfiguration['data'] = {
    labels: [
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
    datasets: [
      {
        label: 'Stock In',
        data: Array(12).fill(0),
        borderColor: '#0078B8',
        backgroundColor: '#0078B8',
        tension: 0.4,
        fill: this.selectedChartType === 'line',
      },
      {
        label: 'Stock Out',
        data: Array(12).fill(0),
        borderColor: '#EF4444',
        backgroundColor: '#EF4444',
        tension: 0.4,
        fill: this.selectedChartType === 'line',
      },
    ],
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, elements) => {
      if (elements.length > 0) this.handleChartClick(elements[0]);
    },
    interaction: {
      mode: 'nearest',
      intersect: true,
      axis: 'xy',
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          generateLabels: (chart) => {
            return chart.data.datasets.map((ds, i) => ({
              text: ds.label || '',
              fillStyle: ds.backgroundColor as string,
              strokeStyle: ds.borderColor as string,
              lineWidth: 1,
              hidden: !chart.isDatasetVisible(i),
              index: i,
            }));
          },
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          labelColor: (context) => {
            return {
              borderColor: context.dataset.borderColor as string,
              backgroundColor: context.dataset.backgroundColor as string,
              borderWidth: 2,
              borderRadius: 2,
            };
          },
          labelTextColor: (context) => {
            return '#fff'; // White text for better contrast
          },
        },
        displayColors: true, // Ensure color boxes are shown
        usePointStyle: true, // Use same style as legend
        boxPadding: 4, // Adjust spacing
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawTicks: true,
          drawOnChartArea: true,
          // @ts-expect-error ng2-charts typings mismatch with Chart.js v4
          border: { display: false },
        },
        title: { display: true, text: 'Quantity' },
      },
    },
  };

  private handleChartClick(element: any): void {
    if (
      element &&
      element.datasetIndex !== undefined &&
      element.index !== undefined
    ) {
      const datasetIndex = element.datasetIndex;
      const index = element.index;

      // 0 for Stock In (first dataset), 1 for Stock Out (second dataset)
      const stockType = datasetIndex;

      const year = this.selectedYear || new Date().getFullYear();

      this.router.navigate(['admin/transaction'], {
        queryParams: {
          type: stockType,
          month: index + 1,
          year: year,
        },
      });
    }
  }

  fetchProviders(): void {
    this.loadingProviders = true;
    this.providers = []; // reset before fetching all

    let page = 1;

    const fetchPage = () => {
      this.providerService
        .getPaginatedProviders(page, this.providerPageSize)
        .subscribe({
          next: (response) => {
            if (response && response.data) {
              const newProviders = response.data.map((provider: any) => ({
                id: provider.id,
                name: provider.name,
              }));

              this.providers = [...this.providers, ...newProviders];

              if (response.hasNextPage) {
                page++;
                fetchPage(); // fetch next page recursively
              } else {
                this.hasMoreProviders = false;
                this.loadingProviders = false;
              }
            } else {
              this.loadingProviders = false;
            }
          },
          error: (error) => {
            console.error('Error fetching providers:', error);
            this.loadingProviders = false;
          },
        });
    };

    fetchPage();
  }

  loadMoreProviders(): void {
    if (this.hasMoreProviders && !this.loadingProviders) {
      this.providerPageNumber++;
      this.fetchProviders();
    }
  }

  loadStockData(): void {
    // Prepare filters object
    const filters = {
      ...(this.selectedYear && { Year: this.selectedYear }),
      ...(this.selectedProviderId && { ProviderId: this.selectedProviderId }),
    };

    this.adminDashboardService.getStockQuantitySum(filters).subscribe({
      next: (response) => {
        if (response.success) {
          // The service returns { sum: number | null; success: boolean }
          this.updateChartData(response.sum || 0);
        } else {
          console.warn('Failed to fetch stock quantity sum');
          this.updateChartData(0); // Provide default value
        }
      },
      error: (error) => {
        console.error('Error fetching stock data:', error);
        this.updateChartData(0); // Provide default value on error
      },
    });
  }

  onFilterChange(): void {
    this.loadStockData();
  }

  updateChartData(apiData: any): void {
    this.lineChartData = {
      ...this.lineChartData,
      datasets: [
        {
          ...this.lineChartData.datasets[0],
          data: apiData.valuesStockIn,
        },
        {
          ...this.lineChartData.datasets[1],
          data: apiData.valuesStockOut,
        },
      ],
    };
  }

  generateYears(): void {
    const currentYear = new Date().getFullYear();
    const pastYears = 3;
    const futureYears = 2;

    this.years = Array.from(
      { length: pastYears + futureYears + 1 },
      (_, i) => currentYear - pastYears + i
    );
  }

  onChartTypeChange(): void {
    const newData = JSON.parse(JSON.stringify(this.lineChartData));

    newData.datasets = newData.datasets.map((dataset: any) => {
      if (this.selectedChartType === 'line') {
        return {
          ...dataset,
          backgroundColor: dataset.borderColor + '33',
          fill: true,
          tension: 0.4,
        };
      } else {
        return {
          ...dataset,
          backgroundColor: dataset.borderColor,
          fill: false,
          tension: 0,
        };
      }
    });

    this.lineChartData = newData;
  }
}
