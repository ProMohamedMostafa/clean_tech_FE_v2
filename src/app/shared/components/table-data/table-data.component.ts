import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  HostListener,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'image' | 'date' | 'custom';
  imageBasePath?: string;
  defaultImage?: string;
  customTemplate?: any;
}

export interface TableAction {
  icon: string;
  label?: string;
  action: (item: any) => void;
  condition?: (item: any, currentUserRole?: string) => boolean;
  style?: any;
}

@Component({
  selector: 'app-table-data',
  imports: [FormsModule, TranslateModule, CommonModule],
  templateUrl: './table-data.component.html',
  styleUrl: './table-data.component.scss',
})
export class TableDataComponent implements OnInit {
  // ========== Inputs ==========
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];
  @Input() currentPage: number = 1;
  @Input() pageSize: number | undefined = 5;
  @Input() totalPages: number = 1;
  @Input() totalCount: number = 0;
  @Input() currentUserRole: string = '';
  @Input() showPagination: boolean = true;
  @Input() trackByField: string = 'id';

  // ========== Outputs ==========
  @Output() pageChanged = new EventEmitter<number>();
  @Output() pageSizeChanged = new EventEmitter<number | undefined>();

  // Track open dropdowns
  openDropdownId: string | null = null;

  constructor(private router: Router) {}

  ngOnInit() {}

  getColumnValue(item: any, column: TableColumn): any {
    const keys = column.key.split('.');
    let value = item;

    for (const key of keys) {
      value = value?.[key];
    }

    return value;
  }

  shouldShowAction(action: TableAction, item: any): boolean {
    if (action.condition) {
      return action.condition(item, this.currentUserRole);
    }
    return true;
  }

  executeAction(action: TableAction, item: any): void {
    this.closeDropdown(); // Close dropdown when action is executed
    action.action(item);
  }

  trackByFn(index: number, item: any): any {
    return item[this.trackByField] || index;
  }

  // ========== Dropdown Methods ==========
  toggleDropdown(event: MouseEvent, item: any): void {
    event.stopPropagation();
    const dropdownId = `dropdown-${
      item[this.trackByField] || Math.random().toString(36).substr(2, 9)
    }`;

    if (this.openDropdownId === dropdownId) {
      this.openDropdownId = null;
    } else {
      this.openDropdownId = dropdownId;
    }
  }

  isDropdownOpen(item: any): boolean {
    const dropdownId = `dropdown-${
      item[this.trackByField] || Math.random().toString(36).substr(2, 9)
    }`;
    return this.openDropdownId === dropdownId;
  }

  closeDropdown(): void {
    this.openDropdownId = null;
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.openDropdownId) {
      this.closeDropdown();
    }
  }

  // ========== Pagination Methods ==========
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.pageChanged.emit(this.currentPage);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.pageChanged.emit(this.currentPage);
    }
  }

  onPageSizeChange(size: number | undefined) {
    this.pageSizeChanged.emit(size);
  }

  // ========== Utility Methods ==========
  showDeleteConfirmation(
    item: any,
    deleteCallback: (item: any) => void,
    itemDisplayName?: string
  ): void {
    const displayName =
      itemDisplayName || item.firstName || item.name || 'this item';

    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${displayName}. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteCallback(item);
      }
    });
  }
}
