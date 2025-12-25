// filter-bar.component.ts
import {
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
  OnInit,
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'reusable-filter-bar',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.scss'],
})
export class ReusableFilterBarComponent implements OnInit {
  @ViewChild('exportSweetAlertTemplate')
  exportSweetAlertTemplate!: TemplateRef<any>;

  // Input properties for customization
  @Input() showAddButton: boolean = true;
  @Input() showRecycleButton: boolean = true;
  @Input() showExportButtons: boolean = true;
  @Input() showPrintButton: boolean = false;
  @Input() addButtonRoute?: string;
  @Input() recycleButtonRoute: string = '';
  @Input() searchPlaceholder: string = 'filterbar.SEARCH_PLACEHOLDER';
  @Input() filterModalTitle: string = 'filterbar.FILTER_TITLE';
  @Input() showSearchBar: boolean = true;
  @Input() showFilterButton: boolean = true;

  // New input properties for filter values
  @Input() selectedStatus?: number;
  @Input() selectedPriority?: number;
  @Input() selectedAssignee?: number;

  // Date range properties
  exportStartDate: string = '';
  exportEndDate: string = '';

  // Output events
  @Output() searchChange = new EventEmitter<string>();
  @Output() filterClick = new EventEmitter<void>();
  @Output() addClick = new EventEmitter<void>();
  @Output() recycleClick = new EventEmitter<void>();
  @Output() exportPdf = new EventEmitter<{
    from: string;
    to: string;
    status?: number;
    priority?: number;
    assignTo?: number;
  }>();
  @Output() exportExcel = new EventEmitter<{
    from: string;
    to: string;
    status?: number;
    priority?: number;
    assignTo?: number;
  }>();
  @Output() print = new EventEmitter<void>();
  @Output() showFilter = new EventEmitter<void>();
  @Output() dateRangeChange = new EventEmitter<{ from: string; to: string }>();

  searchTerm: string = '';

  constructor(private router: Router, private translate: TranslateService) {}

  ngOnInit() {
    // Set default date range on initialization
    this.setDefaultDateRange();
  }

  onSearchChange() {
    this.searchChange.emit(this.searchTerm);
  }

  onAddClick() {
    if (this.addButtonRoute) {
      this.router.navigate([this.addButtonRoute]);
    }
    this.addClick.emit();
  }

  onRecycleClick() {
    if (this.recycleButtonRoute) {
      this.router.navigate([this.recycleButtonRoute]);
    }
    this.recycleClick.emit();
  }

  onExportPdf() {
    const dateRange = this.validateDateRange();
    if (dateRange) {
      const exportData = {
        from: dateRange.from,
        to: dateRange.to,
        status: this.selectedStatus,
        priority: this.selectedPriority,
        assignTo: this.selectedAssignee,
      };
      console.log('Exporting PDF with data:', exportData); // Debug log
      this.exportPdf.emit(exportData);
    }
  }

  onExportExcel() {
    const dateRange = this.validateDateRange();
    if (dateRange) {
      const exportData = {
        from: dateRange.from,
        to: dateRange.to,
        status: this.selectedStatus,
        priority: this.selectedPriority,
        assignTo: this.selectedAssignee,
      };
      console.log('Exporting Excel with data:', exportData); // Debug log
      this.exportExcel.emit(exportData);
    }
  }

  onPrint() {
    this.print.emit();
  }

  onFilterClick() {
    this.filterClick.emit();
  }

  onShowFilter() {
    this.showFilter.emit();
  }

  // Update date range and emit changes
  updateDateRange() {
    if (this.exportStartDate && this.exportEndDate) {
      const dateRange = {
        from: this.exportStartDate,
        to: this.exportEndDate,
      };
      this.dateRangeChange.emit(dateRange);
    }
  }

  // Validate date range and return object if valid
  private validateDateRange(): { from: string; to: string } | null {
    if (!this.exportStartDate || !this.exportEndDate) {
      Swal.fire({
        icon: 'warning',
        title: this.translate.instant('exportSweetAlert.DATE_REQUIRED_TITLE'),
        text: this.translate.instant('exportSweetAlert.DATE_REQUIRED_TEXT'),
        confirmButtonText: this.translate.instant('exportSweetAlert.OK'),
      });
      return null;
    }

    const startDate = new Date(this.exportStartDate);
    const endDate = new Date(this.exportEndDate);

    if (startDate > endDate) {
      Swal.fire({
        icon: 'error',
        title: this.translate.instant('exportSweetAlert.INVALID_DATE_TITLE'),
        text: this.translate.instant('exportSweetAlert.INVALID_DATE_TEXT'),
        confirmButtonText: this.translate.instant('exportSweetAlert.OK'),
      });
      return null;
    }

    return {
      from: this.exportStartDate,
      to: this.exportEndDate,
    };
  }

  // Set default date range (last 30 days)
  private setDefaultDateRange() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    this.exportEndDate = endDate.toISOString().split('T')[0];
    this.exportStartDate = startDate.toISOString().split('T')[0];

    // Emit the default date range
    this.updateDateRange();
  }

  // New SweetAlert method for export options with date range
  showExportSweetAlert() {
    // Set default dates if empty
    if (!this.exportStartDate || !this.exportEndDate) {
      this.setDefaultDateRange();
    }

    Swal.fire({
      title: this.translate.instant('exportSweetAlert.TITLE'),
      html: `
      <div style="display: flex; flex-direction: column; gap: 1.5rem; margin-top: 1rem;">
        <!-- Date Range Inputs -->
        <div style="display: flex; gap: 1rem;">
          <div style="flex: 1;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #333;">
              ${this.translate.instant('exportSweetAlert.FROM_DATE')}
            </label>
            <input 
              type="date" 
              id="export-start-date"
              value="${this.exportStartDate}"
              style="
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #ced4da;
                border-radius: 6px;
                font-size: 1rem;
                transition: border-color 0.15s ease-in-out;
              "
            >
          </div>
          <div style="flex: 1;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #333;">
              ${this.translate.instant('exportSweetAlert.TO_DATE')}
            </label>
            <input 
              type="date" 
              id="export-end-date"
              value="${this.exportEndDate}"
              style="
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #ced4da;
                border-radius: 6px;
                font-size: 1rem;
                transition: border-color 0.15s ease-in-out;
              "
            >
          </div>
        </div>

       

        <!-- Export Options -->
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <button id="pdf-export" class="export-option-btn" style="
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            background: white;
            cursor: pointer;
            transition: all 0.3s ease;
            width: 100%;
            text-align: left;
          ">
            <i class="fas fa-file-pdf" style="color: #dc3545; font-size: 1.5rem; width: 2rem; text-align: center;"></i>
            <div>
              <div style="font-weight: 600; color: #333;">
                ${this.translate.instant('exportSweetAlert.EXPORT_AS_PDF')}
              </div>
              <small style="color: #666; font-size: 0.8rem;">
                ${this.translate.instant('exportSweetAlert.PDF_DESCRIPTION')}
              </small>
            </div>
          </button>
          
          <button id="excel-export" class="export-option-btn" style="
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            background: white;
            cursor: pointer;
            transition: all 0.3s ease;
            width: 100%;
            text-align: left;
          ">
            <i class="fas fa-file-excel" style="color: #198754; font-size: 1.5rem; width: 2rem; text-align: center;"></i>
            <div>
              <div style="font-weight: 600; color: #333;">
                ${this.translate.instant('exportSweetAlert.EXPORT_AS_EXCEL')}
              </div>
              <small style="color: #666; font-size: 0.8rem;">
                ${this.translate.instant('exportSweetAlert.EXCEL_DESCRIPTION')}
              </small>
            </div>
          </button>
        </div>
      </div>
    `,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: this.translate.instant('exportSweetAlert.CANCEL'),
      customClass: {
        popup: 'export-sweetalert-popup',
        cancelButton: 'export-cancel-btn',
      },
      didOpen: () => {
        // Set date input max attribute to today
        const today = new Date().toISOString().split('T')[0];
        const startDateInput = document.getElementById(
          'export-start-date'
        ) as HTMLInputElement;
        const endDateInput = document.getElementById(
          'export-end-date'
        ) as HTMLInputElement;

        if (startDateInput) {
          startDateInput.max = today;
        }
        if (endDateInput) {
          endDateInput.max = today;
        }

        // Add input event listeners
        startDateInput?.addEventListener('change', (event) => {
          this.exportStartDate = (event.target as HTMLInputElement).value;
          this.updateDateRange();
        });

        endDateInput?.addEventListener('change', (event) => {
          this.exportEndDate = (event.target as HTMLInputElement).value;
          this.updateDateRange();
        });

        // Style export option buttons
        const buttons = document.querySelectorAll('.export-option-btn');
        buttons.forEach((button) => {
          button.addEventListener('mouseenter', () => {
            (button as HTMLElement).style.background = '#f8f9fa';
            (button as HTMLElement).style.borderColor = '#025d8d';
            (button as HTMLElement).style.transform = 'translateY(-2px)';
            (button as HTMLElement).style.boxShadow =
              '0 4px 12px rgba(0, 0, 0, 0.1)';
          });

          button.addEventListener('mouseleave', () => {
            (button as HTMLElement).style.background = 'white';
            (button as HTMLElement).style.borderColor = '#e9ecef';
            (button as HTMLElement).style.transform = 'translateY(0)';
            (button as HTMLElement).style.boxShadow = 'none';
          });
        });

        // Add export event listeners
        document.getElementById('pdf-export')?.addEventListener('click', () => {
          this.onExportPdf();
          Swal.close();
        });

        document
          .getElementById('excel-export')
          ?.addEventListener('click', () => {
            this.onExportExcel();
            Swal.close();
          });
      },
    });
  }
}
