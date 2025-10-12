import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuditService } from '../../../../services/audit.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-audits-per-month-graph',
  standalone: true,
  imports: [NgChartsModule, FormsModule, TranslateModule, CommonModule],
  templateUrl: './audits-per-month-graph.component.html',
  styleUrls: ['./audits-per-month-graph.component.scss'],
})
export class AuditsPerMonthGraphComponent implements OnInit {
  public years: number[] = [];
  public selectedYear!: number;

  // default options for bar/line charts
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Number of Audits' },
      },
      x: {
        title: { display: true, text: 'Months' },
      },
    },
    plugins: {
      legend: { display: true },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.y}`,
        },
      },
    },
  };

  public barChartType: ChartType = 'bar';
  public barChartData!: ChartData;

  // chart type selector
  public selectedChartType: ChartType = 'bar'; // default
  public availableChartTypes: ChartType[] = [
    'bar',
    'line',
    'pie',
    'doughnut',
    'radar',
    'polarArea',
  ];

  constructor(private auditService: AuditService) {}

  ngOnInit(): void {
    this.generateYears(5); // last 5 years
    this.selectedYear = this.years[0]; // latest year
    this.fetchAuditData();
  }

  generateYears(count: number): void {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: count }, (_, i) => currentYear - i);
  }

  fetchAuditData(): void {
    this.auditService.getAuditSum(this.selectedYear).subscribe({
      next: (data) => {
        if (data && data.labels && data.values) {
          this.processChartData(data);
        } else {
          this.processChartData({ labels: [], values: [] });
        }
      },
      error: (err) => console.error('Error fetching audit data:', err),
    });
  }

  processChartData(apiData: any): void {
    this.barChartData = {
      labels: apiData.labels,
      datasets: [
        {
          label: 'Audits per Month',
          data: apiData.values,
          backgroundColor: [
            'rgba(75, 192, 192, 0.7)',
            'rgba(255, 99, 132, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(199, 199, 199, 0.7)',
            'rgba(100, 181, 246, 0.7)',
            'rgba(77, 182, 172, 0.7)',
            'rgba(255, 138, 101, 0.7)',
            'rgba(174, 213, 129, 0.7)',
            'rgba(244, 143, 177, 0.7)',
          ],
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  }

  onYearChange(year: number): void {
    this.selectedYear = year;
    this.fetchAuditData();
  }

  onChartTypeChange(): void {
    this.barChartType = this.selectedChartType;
  }

  trackByYear(index: number, year: number): number {
    return year;
  }
}
