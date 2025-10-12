import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { DatePipe } from '@angular/common'; // Import DatePipe
import { CalendarService } from '../../services/calendar.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-daily-calendar',
  imports: [TranslateModule],
  providers: [DatePipe],
  templateUrl: './daily-calendar.component.html',
  styleUrl: './daily-calendar.component.scss',
})
export class DailyCalendarComponent {
  currentDate: Date = new Date();
  currentYear: number = this.currentDate.getFullYear();
  currentMonth: number = this.currentDate.getMonth();
  selectedMonth: number = new Date().getMonth(); // Current month
  selectedDay: number = 0; // Initialize with 0 or a default value
  daysArray: any[] = []; // Updated to support placeholders

  months: string[] = [
    'CALENDAR.MONTHS.JAN',
    'CALENDAR.MONTHS.FEB',
    'CALENDAR.MONTHS.MAR',
    'CALENDAR.MONTHS.APR',
    'CALENDAR.MONTHS.MAY',
    'CALENDAR.MONTHS.JUN',
    'CALENDAR.MONTHS.JUL',
    'CALENDAR.MONTHS.AUG',
    'CALENDAR.MONTHS.SEP',
    'CALENDAR.MONTHS.OCT',
    'CALENDAR.MONTHS.NOV',
    'CALENDAR.MONTHS.DEC',
  ];

  @Output() dateSelected = new EventEmitter<string>(); // Emit selected date as string

  constructor(
    private cdr: ChangeDetectorRef,
    private calendarService: CalendarService,
    private datePipe: DatePipe // Inject DatePipe
  ) {}

  ngOnInit(): void {
    this.updateDays(); // Initialize the days when the component is initialized
  }

  selectDay(day: number): void {
    this.selectedDay = day;
    const formattedDate = new Date(this.currentYear, this.selectedMonth, day);

    // Format the selected date to "yyyy-MM-dd"
    const formattedDateString = this.datePipe.transform(
      formattedDate,
      'yyyy-MM-dd'
    );

    // Emit the formatted date to the parent
    if (formattedDateString) {
      this.dateSelected.emit(formattedDateString);
    }
  }

  selectMonth(index: number): void {
    this.selectedMonth = index;
    this.currentMonth = index; // Update currentMonth to reflect the selected month
    this.updateDays(); // Update the days when the month changes
  }

  goToPreviousMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.selectedMonth = this.currentMonth;
    this.updateDays();
  }

  goToNextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.selectedMonth = this.currentMonth;
    this.updateDays();
  }

  getDaysInMonth(): number {
    return new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
  }

  getFirstDayOfMonth(): number {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    return firstDay.getDay();
  }

  getDaysArray(): any[] {
    const daysInMonth = this.getDaysInMonth();
    const firstDay = this.getFirstDayOfMonth();
    const daysArray: any[] = [];

    for (let i = 0; i < firstDay; i++) {
      daysArray.push({ day: '', isPlaceholder: true });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push({ day: i, isPlaceholder: false });
    }

    const totalDays = daysArray.length;
    const remainingSlots = 7 - (totalDays % 7);
    if (remainingSlots < 7) {
      for (let i = 0; i < remainingSlots; i++) {
        daysArray.push({ day: '', isPlaceholder: true });
      }
    }

    return daysArray;
  }

  updateDays(): void {
    this.daysArray = this.getDaysArray();
    this.cdr.detectChanges();
  }
}
