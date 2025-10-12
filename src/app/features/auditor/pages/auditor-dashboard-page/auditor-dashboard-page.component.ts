import { Component } from '@angular/core';
import { LocationCardsComponent } from "./components/location-cards/location-cards.component";
import { AuditsPerMonthGraphComponent } from "./components/audits-per-month-graph/audits-per-month-graph.component";
import { RecentActivityComponent } from "../../../admin/components/Admin-dashboard/recent-activity/recent-activity.component";

@Component({
  selector: 'app-auditor-dashboard-page',
  imports: [LocationCardsComponent, AuditsPerMonthGraphComponent, RecentActivityComponent],
  templateUrl: './auditor-dashboard-page.component.html',
  styleUrl: './auditor-dashboard-page.component.scss'
})
export class AuditorDashboardPageComponent {

}
