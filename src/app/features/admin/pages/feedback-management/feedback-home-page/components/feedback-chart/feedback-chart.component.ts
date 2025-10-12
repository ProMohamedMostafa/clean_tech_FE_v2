// feedback-chart.component.ts
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FeedbackDeviceService } from '../../../../../services/feedback/feedback.service';
import { DevicesService } from '../../../../../services/feedback/devices.service';

@Component({
  selector: 'app-feedback-chart',
  standalone: true,
  imports: [NgChartsModule, FormsModule, TranslateModule],
  templateUrl: './feedback-chart.component.html',
  styleUrls: ['./feedback-chart.component.scss'],
})
export class FeedbackChartComponent implements OnInit {
  constructor(
    private devicesService: DevicesService,
    private feedbackDeviceService: FeedbackDeviceService,
    private translate: TranslateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.generateYears();
    this.loadFeedbackData();
    this.fetchDevices();
    this.onChartTypeChange();
  }

  // Filter properties
  selectedYear: number | null = null;
  selectedDeviceId: number | null = null;
  years: number[] = [];
  devices: { id: number; name: string }[] = [];
  selectedChartType: ChartType = 'bar';

  // Chart configuration
  public chartData: ChartConfiguration['data'] = {
    labels: [
      'dashboard.MONTH_JAN',
      'dashboard.MONTH_FEB',
      'dashboard.MONTH_MAR',
      'dashboard.MONTH_APR',
      'dashboard.MONTH_MAY',
      'dashboard.MONTH_JUN',
      'dashboard.MONTH_JUL',
      'dashboard.MONTH_AUG',
      'dashboard.MONTH_SEP',
      'dashboard.MONTH_OCT',
      'dashboard.MONTH_NOV',
      'dashboard.MONTH_DEC',
    ],
    datasets: [
      {
        label: this.translate.instant('dashboard.FEEDBACK_COUNT'),
        data: Array(12).fill(0),
        borderColor: '#46B749',
        backgroundColor: '#46B749',
        tension: 0.4,
        fill: this.selectedChartType === 'line',
      },
    ],
  };

  public chartOptions: ChartConfiguration['options'] = {
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
          labelTextColor: () => '#fff',
        },
        displayColors: true,
        usePointStyle: true,
        boxPadding: 4,
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
        text: this.translate.instant('dashboard.FEEDBACK_COUNT'),
      },
      x: {
        grid: {
          // @ts-expect-error ng2-charts typings mismatch with Chart.js v4
          border: { display: false },
        },
      },
    },
  };

  private handleChartClick(element: any): void {
    if (element && element.index !== undefined) {
      const monthIndex = element.index;
      const year = this.selectedYear || new Date().getFullYear();

      this.router.navigate(['admin/devices'], {
        queryParams: {
          month: monthIndex + 1,
          year: year,
          ...(this.selectedDeviceId && { deviceId: this.selectedDeviceId }),
        },
      });
    }
  }

  // ✅ Fetch devices dynamically (Type = 1)
  fetchDevices(): void {
    this.devicesService.getDevices({ PageNumber: 1 }).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.devices = response.data.data.map((device: any) => ({
            id: device.id,
            name: device.name,
          }));
        } else {
          this.devices = [];
        }
      },
      error: (error) => {
        console.error('Error fetching devices:', error);
        this.devices = [];
      },
    });
  }

  loadFeedbackData(): void {
    const filters: { Year?: number; FeedbackDeviceId?: number } = {
      ...(this.selectedYear && { Year: this.selectedYear }),
      ...(this.selectedDeviceId && { FeedbackDeviceId: this.selectedDeviceId }),
    };

    this.feedbackDeviceService.getAnswersCount(filters).subscribe({
      next: (response) => {
        if (response && response.labels && response.values) {
          this.updateChartData(response);
        } else {
          this.updateChartData({ labels: [], values: Array(12).fill(0) });
        }
      },
      error: (error) => {
        console.error('Error fetching feedback data:', error);
        this.updateChartData({ labels: [], values: Array(12).fill(0) });
      },
    });
  }

  onFilterChange(): void {
    this.loadFeedbackData();
  }

  updateChartData(apiData: { labels: string[]; values: number[] }): void {
    const abbreviatedLabels = apiData.labels.map((label) =>
      label.substring(0, 3)
    );

    this.chartData = {
      ...this.chartData,
      labels:
        abbreviatedLabels.length === 12
          ? abbreviatedLabels
          : this.chartData.labels,
      datasets: [
        {
          ...this.chartData.datasets[0],
          data:
            apiData.values.length === 12 ? apiData.values : Array(12).fill(0),
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
    const newData = JSON.parse(JSON.stringify(this.chartData));

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

    this.chartData = newData;
  }
}
