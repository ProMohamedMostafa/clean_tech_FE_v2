import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private selectedDateSource = new BehaviorSubject<Date | null>(null);
  selectedDate$ = this.selectedDateSource.asObservable();

  setSelectedDate(date: Date): void {
    this.selectedDateSource.next(date);
  }
}
