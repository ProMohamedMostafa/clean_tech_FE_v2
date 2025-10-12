import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Add this import
import Swal from 'sweetalert2';
import {
  CalendarModule,
  DateAdapter,
  CalendarDateFormatter,
  CalendarUtils,
  CalendarA11y,
  ɵCalendarA11yPipe,
  CalendarEventTitleFormatter,
} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { Subject } from 'rxjs';
import { addMonths, subMonths } from 'date-fns';
import { CommonModule } from '@angular/common';
import { ShiftService } from '../../../services/shift.service';
import { getUserRole } from '../../../../../core/helpers/auth.helpers';

@Component({
  selector: 'app-shift-calendar',
  standalone: true,
  imports: [CalendarModule, CommonModule],
  templateUrl: './shift-calendar.component.html',
  styleUrls: ['./shift-calendar.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useFactory: adapterFactory,
    },
    CalendarDateFormatter,
    CalendarUtils,
    CalendarA11y,
    ɵCalendarA11yPipe,
    CalendarEventTitleFormatter,
  ],
})
export class ShiftCalendarComponent {
  viewDate: Date = new Date();
  events: any[] = [];
  refresh: Subject<any> = new Subject();
  colorPalette = ['#0077b6', '#00b4d8', '#90e0ef', '#48cae4', '#0096c7'];
  locale: string = 'en';

  // Inject Router in constructor
  constructor(
    private shiftService: ShiftService,
    private router: Router // Add Router injection
  ) {}

  ngOnInit(): void {
    this.loadShifts();
  }

  loadShifts(): void {
    this.shiftService
      .getPaginatedShifts({
        pageNumber: 1,
      })
      .subscribe((response) => {
        if (response && response.succeeded && response.data) {
          this.events = response.data.data.map((shift: any, index: number) => ({
            start: new Date(`${shift.startDate}T${shift.startTime}`),
            end: new Date(`${shift.endDate}T${shift.endTime}`),
            title: shift.name,
            allDay: false,
            meta: shift,
            color: {
              primary: this.colorPalette[index % this.colorPalette.length],
              secondary: '#e0f4ff',
            },
          }));

          this.refresh.next({});
        }
      });
  }

  previousMonth(): void {
    this.viewDate = subMonths(this.viewDate, 1);
  }

  nextMonth(): void {
    this.viewDate = addMonths(this.viewDate, 1);
  }

  onEventClicked(event: any): void {
    const shift = event.meta;
    Swal.fire({
      title: shift.name,
      html: `
        <div style="text-align:left">
          <p><strong>Start:</strong> ${new Date(
            shift.startDate + 'T' + shift.startTime
          ).toLocaleString()}</p>
          <p><strong>End:</strong> ${new Date(
            shift.endDate + 'T' + shift.endTime
          ).toLocaleString()}</p>
        </div>
      `,
      icon: 'info',
      confirmButtonColor: '#0077b6',
      confirmButtonText: 'Close',
      showCancelButton: true, // Add cancel button for navigation
      cancelButtonText: 'View Details',
      cancelButtonColor: '#48cae4',
    }).then((result) => {
      if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
        // Navigate to shift details when "View Details" is clicked
        this.navigateToShiftDetails(shift.id);
      }
    });
  }

  // New method to navigate to shift details
  navigateToShiftDetails(shiftId: number): void {
    let userRole = getUserRole().toLowerCase();
    this.router.navigate([`${userRole}/shift-details/${shiftId}`]);
  }

  onDayClicked(day: any): void {
    // Optional: implement to show shifts of the day
  }
}
