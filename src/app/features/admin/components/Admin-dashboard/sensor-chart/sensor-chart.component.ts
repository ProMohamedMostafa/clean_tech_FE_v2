import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { SensorService } from '../../../services/sensor.service';
import { SectionService } from '../../../services/work-location/section.service';
import { map, catchError, finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Section } from '../../../models/work-location/section.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-sensor-chart',
  standalone: true,
  imports: [NgChartsModule, CommonModule, FormsModule, TranslateModule],
  templateUrl: './sensor-chart.component.html',
  styleUrls: ['./sensor-chart.component.scss'],
})
export class SensorChartComponent implements OnInit {
  constructor(
    private sensorService: SensorService,
    private sectionService: SectionService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  public chartType: ChartType = 'polarArea';
  public loading = false;
  public loadingSections = false;
  public hasChartData = false;

  // Section-related
  public sections: Section[] = [];
  public selectedSectionId: number | null = null;
  public selectedYear = new Date().getFullYear(); // Current year as default
  public selectedMonth = new Date().getMonth() + 1; // Current month as default

  // Year options (last 5 years and next 5 years)
  public yearOptions: number[] = this.generateYearOptions();

  // Month options with translation keys
  public monthOptions = [
    { value: 1, label: 'months.JAN' },
    { value: 2, label: 'months.FEB' },
    { value: 3, label: 'months.MAR' },
    { value: 4, label: 'months.APR' },
    { value: 5, label: 'months.MAY' },
    { value: 6, label: 'months.JUN' },
    { value: 7, label: 'months.JUL' },
    { value: 8, label: 'months.AUG' },
    { value: 9, label: 'months.SEP' },
    { value: 10, label: 'months.OCT' },
    { value: 11, label: 'months.NOV' },
    { value: 12, label: 'months.DEC' },
  ];

  // Chart types with translation keys
  public availableChartTypes: { key: ChartType; label: string }[] = [
    { key: 'bar', label: 'dashboard.BAR' },
    { key: 'line', label: 'dashboard.LINE' },
    { key: 'polarArea', label: 'dashboard.POLAR_AREA' },
  ];
  public selectedChartType: ChartType = 'polarArea';

  public chartData: ChartConfiguration['data'] = {
    labels: [
      this.translate.instant('dashboard.PENDING'),
      this.translate.instant('dashboard.IN_PROGRESS'),
      this.translate.instant('dashboard.COMPLETED'),
      this.translate.instant('dashboard.OVERDUE'),
    ],

    datasets: [
      {
        data: [0, 0, 0, 0],
        backgroundColor: ['#67CF42', '#DF8412', '#018FFB', '#E12121'],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        ticks: {
          stepSize: 20,
          backdropColor: 'transparent',
        },
        grid: {
          circular: true,
        },
      },
    },
  };

  public sensorData: any[] = [];
  public totalCompletion = 0;

  ngOnInit(): void {
    this.loadSections();
    this.loadCompletionTasks();
  }

  // Generate year options (current year ± 5 years)
  private generateYearOptions(): number[] {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(i);
    }
    return years;
  }

  loadSections(): void {
    this.loadingSections = true;
    this.sectionService
      .getSectionsPaged({
        PageNumber: 1,
        PageSize: 1000,
      })
      .pipe(
        catchError((error) => {
          console.error('Error loading sections:', error);
          return of({
            data: [],
            currentPage: 1,
            totalPages: 1,
            totalCount: 0,
            pageSize: 0,
            hasPreviousPage: false,
            hasNextPage: false,
          });
        }),
        finalize(() => {
          this.loadingSections = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe((paginationData) => {
        this.sections = paginationData.data || [];
      });
  }

  onSectionChange(): void {
    if (this.selectedSectionId) {
      this.loadCompletionTasks();
    }
  }

  onYearChange(): void {
    if (this.selectedSectionId) {
      this.loadCompletionTasks();
    }
  }

  onMonthChange(): void {
    if (this.selectedSectionId) {
      this.loadCompletionTasks();
    }
  }

  loadCompletionTasks(): void {
    this.loading = true;
    this.hasChartData = false;

    this.sensorService
      .getCompletionTasks(
        this.selectedSectionId ?? undefined, // optional
        this.selectedYear ?? undefined, // optional
        this.selectedMonth ?? undefined // optional
      )
      .pipe(
        map((res) => res?.data),
        catchError((error) => {
          console.error('Error loading completion tasks:', error);
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe((data) => {
        if (!data) {
          this.hasChartData = false;
          this.sensorData = [];
          this.totalCompletion = 0;
          return;
        }

        this.sensorData = [...data.getCompletionDeviceTask];

        const chartValues = [
          data.status.pendingPercentage,
          data.status.inProgressPercentage,
          data.status.completedPercentage,
          data.status.overduePercentage,
        ];

        this.hasChartData = chartValues.some((val) => val > 0);

        this.chartData = {
          ...this.chartData,
          datasets: [
            {
              ...this.chartData.datasets[0],
              data: chartValues,
            },
          ],
        };

        this.totalCompletion = data.totalCompletionPercentage;
        this.cdr.detectChanges();
      });
  }

  getSelectedMonthLabel(): string {
    const selected = this.monthOptions.find(
      (m) => m.value === this.selectedMonth
    );
    return selected ? selected.label : 'months.DEC';
  }
}
