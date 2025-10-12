import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-feedback-card',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './feedback-card.component.html',
  styleUrls: ['./feedback-card.component.scss'],
})
export class FeedbackCardComponent {
  @Input() card: any;

  @Output() view = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  dropdownOpen = false;

  /** Toggle dropdown */
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  /** Close dropdown when clicking outside */
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.dropdownOpen = false;
    }
  }

  onView() {
    this.view.emit(this.card);
    this.dropdownOpen = false;
  }

  onEdit() {
    this.edit.emit(this.card);
    this.dropdownOpen = false;
  }

  onDelete() {
    this.delete.emit(this.card);
    this.dropdownOpen = false;
  }
}
