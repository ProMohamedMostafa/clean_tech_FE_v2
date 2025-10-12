import { Component } from '@angular/core';
import { FeedbackCardsComponent } from "./components/feedback-cards/feedback-cards.component";
import { FeedbackChartComponent } from "./components/feedback-chart/feedback-chart.component";
import { OverviewChartComponent } from "./components/overview-chart/overview-chart.component";
import { StatisticsTableComponent } from "./components/statistics-table/statistics-table.component";

@Component({
  selector: 'app-feedback-home-page',
  imports: [FeedbackCardsComponent, FeedbackChartComponent, OverviewChartComponent, StatisticsTableComponent],
  templateUrl: './feedback-home-page.component.html',
  styleUrl: './feedback-home-page.component.scss'
})
export class FeedbackHomePageComponent {

}
