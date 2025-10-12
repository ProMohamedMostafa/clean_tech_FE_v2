import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartOptions, ChartData } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { FeedbackDeviceService } from '../../../../../services/feedback/feedback.service';
import { TranslateModule } from '@ngx-translate/core';
import { LocationFilterComponent } from '../feedback-cards/location-filter/location-filter.component';

@Component({
  selector: 'app-overview-chart',
  standalone: true,
  imports: [
    CommonModule,
    NgChartsModule,
    TranslateModule,
    LocationFilterComponent,
  ],
  templateUrl: './overview-chart.component.html',
  styleUrls: ['./overview-chart.component.scss'],
})
export class OverviewChartComponent implements OnInit {
  private feedbackDeviceService = inject(FeedbackDeviceService);

  public polarAreaChartData: ChartData<'polarArea'> = {
    labels: ['Feedbacks', 'Audits'],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ['#018FFB', '#67CF42'],
        borderColor: ['#018FFB', '#67CF42'],
        borderWidth: 1,
      },
    ],
  };

  public polarAreaChartOptions: ChartOptions<'polarArea'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      r: {
        grid: { color: '#F5F5F5' },
        angleLines: { color: '#D4D4D4' },
        ticks: { display: false, backdropColor: 'transparent' },
        pointLabels: { display: false },
      },
    },
  };

  public totalFeedbacks = 0;
  public totalAudits = 0;
  public isLoading = true;
  public showFilterModal = false;

  ngOnInit(): void {
    this.loadChartData();
  }

  private loadChartData(filters?: any): void {
    this.isLoading = true;
    this.feedbackDeviceService.getHomeAudits(filters || {}).subscribe({
      next: (data) => {
        if (data) {
          const feedbackIndex = data.labels.findIndex((l) =>
            l.toLowerCase().includes('feedback')
          );
          const auditIndex = data.labels.findIndex((l) =>
            l.toLowerCase().includes('audit')
          );

          const chartLabels = ['Feedbacks', 'Audits'];
          const chartData = [
            feedbackIndex >= 0 ? data.values[feedbackIndex] : 0,
            auditIndex >= 0 ? data.values[auditIndex] : 0,
          ];
          const chartColors = ['#018FFB', '#67CF42']; // feedback first, audit second

          this.polarAreaChartData = {
            labels: chartLabels,
            datasets: [
              {
                data: chartData,
                backgroundColor: chartColors,
                borderColor: chartColors,
                borderWidth: 1,
              },
            ],
          };

          // Update totals
          this.totalFeedbacks = chartData[0];
          this.totalAudits = chartData[1];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading chart data:', error);
        this.isLoading = false;
      },
    });
  }

  public onFilterChange(filterData: any): void {
    const filters = {
      AreaId: filterData.selectedArea,
      CityId: filterData.selectedCity,
      OrganizationId: filterData.selectedOrganization,
      BuildingId: filterData.selectedBuilding,
      FloorId: filterData.selectedFloor,
    };

    this.loadChartData(filters);
  }

  public openFilterModal(): void {
    this.showFilterModal = true;
  }

  public closeFilterModal(): void {
    this.showFilterModal = false;
  }
}
