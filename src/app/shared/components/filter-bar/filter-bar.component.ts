// filter-bar.component.ts
import {
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
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
export class ReusableFilterBarComponent {
  @ViewChild('exportSweetAlertTemplate')
  exportSweetAlertTemplate!: TemplateRef<any>;

  // Input properties for customization
  @Input() showAddButton: boolean = true;
  @Input() showRecycleButton: boolean = true;
  @Input() showExportButtons: boolean = true;
  @Input() showPrintButton: boolean = true;
  @Input() addButtonRoute?: string;
  @Input() recycleButtonRoute: string = '';
  @Input() searchPlaceholder: string = 'filterbar.SEARCH_PLACEHOLDER';
  @Input() filterModalTitle: string = 'filterbar.FILTER_TITLE';
  @Input() showSearchBar: boolean = true;
  @Input() showFilterButton: boolean = true;
  // Output events
  @Output() searchChange = new EventEmitter<string>();
  @Output() filterClick = new EventEmitter<void>();
  @Output() addClick = new EventEmitter<void>();
  @Output() recycleClick = new EventEmitter<void>();
  @Output() exportPdf = new EventEmitter<void>();
  @Output() exportExcel = new EventEmitter<void>();
  @Output() print = new EventEmitter<void>();
  @Output() showFilter = new EventEmitter<void>();
  searchTerm: string = '';

  constructor(private router: Router, private translate: TranslateService) {}

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
    console.log('true from search-bar');
  }

  onShowFilter() {
  this.showFilter.emit();
  console.log('Show filter button clicked');
}


  // New SweetAlert method for export options
  showExportSweetAlert() {
    Swal.fire({
      title: this.translate.instant('exportSweetAlert.TITLE'),
      html: `
      <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
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
    `,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: this.translate.instant('exportSweetAlert.CANCEL'),
      customClass: {
        popup: 'export-sweetalert-popup',
        cancelButton: 'export-cancel-btn',
      },
      didOpen: () => {
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
