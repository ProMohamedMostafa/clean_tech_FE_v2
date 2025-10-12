import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LogsService } from '../../../services/logs.service';
import { getUserRole } from '../../../../../core/helpers/auth.helpers';

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [RouterModule, CommonModule, TranslateModule],
  templateUrl: './recent-activity.component.html',
  styleUrls: ['./recent-activity.component.css'],
})
export class RecentActivityComponent implements OnInit {
  activeTab: 'myActivity' | 'teamActivity' = 'myActivity';
  myActivities: any[] = [];
  teamActivities: any[] = [];
  isLoading = true;
  userRole = getUserRole().toLowerCase();
  constructor(private logsService: LogsService, private router: Router) {}

  ngOnInit(): void {
    this.loadMyActivities();
  }

  setActiveTab(tab: 'myActivity' | 'teamActivity') {
    this.activeTab = tab;
    if (tab === 'myActivity' && this.myActivities.length === 0) {
      this.loadMyActivities();
    } else if (tab === 'teamActivity' && this.teamActivities.length === 0) {
      this.loadTeamActivities();
    }
  }

  private loadMyActivities() {
    this.isLoading = true;
    this.logsService
      .getLogs(
        1, // pageNumber
        5, // pageSize
        '', // search
        undefined, // roleId
        undefined, // userId
        undefined, // startDate
        undefined, // endDate
        undefined, // action
        undefined, // module
        true // History: TRUE for My Activity
      )
      .subscribe({
        next: (response) => {
          this.myActivities = this.transformLogs(response.data);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading my activities:', error);
          this.isLoading = false;
        },
      });
  }

  private loadTeamActivities() {
    this.isLoading = true;
    this.logsService
      .getLogs(
        1, // pageNumber
        5, // pageSize
        '', // search
        undefined, // roleId
        undefined, // userId
        undefined, // startDate
        undefined, // endDate
        undefined, // action
        undefined, // module
        false // History: FALSE for Team Activity
      )
      .subscribe({
        next: (response) => {
          this.teamActivities = this.transformLogs(response.data);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading team activities:', error);
          this.isLoading = false;
        },
      });
  }

  private transformLogs(logs: any[]): any[] {
    return logs.map((log) => {
      return {
        icon: this.getIconForAction(log.actionTypeId),
        description: log.message,
        time: log.createdAt, // TimeAgoPipe will handle the formatting
        user: log.userName,
        action: log.message.replace(`${log.userName} `, ''),
      };
    });
  }

  private getIconForAction(actionTypeId: number): string {
    const icons: { [key: number]: string } = {
      5: 'fas fa-sign-in-alt', // Login
      7: 'fas fa-clock', // ClockIn
      8: 'fas fa-clock', // ClockOut
      18: 'fas fa-bell', // Reminder
      // Add more mappings as needed
    };
    return icons[actionTypeId] || 'fas fa-info-circle';
  }

  navigateToUserManagement(): void {
    const userRole = getUserRole();

    // Route mapping for different roles
    const roleRoutes: { [key: string]: string } = {
      Admin: 'admin',
      Manager: 'manager',
      Supervisor: 'supervisor',
      Cleaner: 'cleaner',
    };

    const baseRoute = roleRoutes[userRole] || 'admin'; // Default to 'admin' if role not found
    this.router.navigate([`/${baseRoute}/recent-activities`]);
  }
}
