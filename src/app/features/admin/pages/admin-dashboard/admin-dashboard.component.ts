import { Component, OnInit } from '@angular/core';
import { NgChartsModule } from 'ng2-charts';
import { DashboardCardsComponent } from '../../components/Admin-dashboard/dashboard-cards/dashboard-cards.component';
import { StockChartComponent } from '../../components/Admin-dashboard/stock-chart/stock-chart.component';
import { RecentActivityComponent } from '../../components/Admin-dashboard/recent-activity/recent-activity.component';
import { TaskCompletionRateComponent } from '../../components/Admin-dashboard/task-completion-rate/task-completion-rate.component';
import { AttendanceTableComponent } from '../../components/Admin-dashboard/attendance-table/attendance-table.component';
import { TaskPieChartComponent } from '../../components/Admin-dashboard/task-pie-chart/task-pie-chart.component';
import { SensorChartComponent } from '../../components/Admin-dashboard/sensor-chart/sensor-chart.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    DashboardCardsComponent,
    StockChartComponent,
    RecentActivityComponent,
    NgChartsModule,
    TaskCompletionRateComponent,
    AttendanceTableComponent,
    TaskPieChartComponent,
    SensorChartComponent,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent {}
