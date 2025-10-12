import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-feedback-filter-bar',
  imports: [CommonModule, TranslateModule, FormsModule],
  templateUrl: './feedback-filter-bar.component.html',
  styleUrl: './feedback-filter-bar.component.scss',
})
export class FeedbackFilterBarComponent {
  // Input properties for customization
  @Input() showDeleteButton: boolean = true;
  @Input() showAssignButton: boolean = true;
  @Input() showCreateButton: boolean = true;
  @Input() showExportButtons: boolean = true;
  @Input() showPrintButton: boolean = true;
  @Input() createButtonRoute?: string;
  @Input() assignButtonRoute?: string;
  @Input() deleteButtonRoute?: string;
  @Input() searchPlaceholder: string = '';
  @Input() filterModalTitle: string = '';

  // Output events
  @Output() searchChange = new EventEmitter<string>();
  @Output() filterClick = new EventEmitter<void>();
  @Output() createClick = new EventEmitter<void>();
  @Output() assignClick = new EventEmitter<void>();
  @Output() deleteClick = new EventEmitter<number>();
  @Output() exportPdf = new EventEmitter<void>();
  @Output() exportExcel = new EventEmitter<void>();
  @Output() print = new EventEmitter<void>();

  searchTerm: string = '';

  constructor(private router: Router) {}

  onSearchChange() {
    this.searchChange.emit(this.searchTerm);
  }

  onCreateClick() {
    if (this.createButtonRoute) {
      this.router.navigate([this.createButtonRoute]);
    }
    this.createClick.emit();
  }

  onAssignClick() {
    if (this.assignButtonRoute) {
      this.router.navigate([this.assignButtonRoute]);
    }
    this.assignClick.emit();
  }

  onDeleteClick(id?: number) {
    if (this.deleteButtonRoute) {
      this.router.navigate([this.deleteButtonRoute]);
    }
    if (id !== undefined) {
      this.deleteClick.emit(id);
    } else {
      this.deleteClick.emit(); // emit without id
    }
  }

  onExportPdf() {
    this.exportPdf.emit();
  }

  onExportExcel() {
    this.exportExcel.emit();
  }

  onPrint() {
    this.print.emit();
  }

  onFilterClick() {
    this.filterClick.emit();
  }
}
