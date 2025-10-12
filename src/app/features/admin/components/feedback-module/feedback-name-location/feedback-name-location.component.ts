import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

interface LocationItem {
  icon: string;
  title: string;
  value: string;
}

@Component({
  selector: 'app-feedback-name-location',
  templateUrl: './feedback-name-location.component.html',
  styleUrls: ['./feedback-name-location.component.scss'],
  imports:[TranslateModule,CommonModule]
})
export class FeedbackNameLocationComponent {
  @Input() feedbackName: string = 'Feedback 1.2.3';
  @Input() locationData: LocationItem[] = [];
}
