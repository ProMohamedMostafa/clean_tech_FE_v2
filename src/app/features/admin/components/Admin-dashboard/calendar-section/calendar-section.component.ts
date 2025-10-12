import { Component } from '@angular/core';
import { IgxCalendarComponent } from 'igniteui-angular';

@Component({
  selector: 'app-calendar-section',
  standalone: true,
  imports: [IgxCalendarComponent], // Changed from IgxCalendarComponent to IgxCalendarModule
  templateUrl: './calendar-section.component.html',
  styleUrls: ['./calendar-section.component.css'],
})
export class CalendarSectionComponent {}
