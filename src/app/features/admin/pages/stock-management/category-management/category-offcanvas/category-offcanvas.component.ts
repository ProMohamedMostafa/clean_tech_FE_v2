import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { CategoryService } from '../../../../services/stock-service/category.service';

@Component({
  selector: 'app-category-offcanvas',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './category-offcanvas.component.html',
  styleUrls: ['./category-offcanvas.component.scss'],
})
export class CategoryOffcanvasComponent {
  @Input() categoryEditData: any = null;
  @Input() parentCategories: any[] = [];
  @Output() categoryUpdated = new EventEmitter<void>();

  categoryData: any = {
    name: '',
    parentCategoryId: null,
    unit: null, // unit id
  };

  unitOptions = [
    { id: 0, name: 'Ml', key: 'ML' },
    { id: 1, name: 'L', key: 'L' },
    { id: 2, name: 'Kg', key: 'KG' },
    { id: 3, name: 'G', key: 'G' },
    { id: 4, name: 'M', key: 'M' },
    { id: 5, name: 'Cm', key: 'CM' },
    { id: 6, name: 'Pieces', key: 'PIECES' },
  ];

  constructor(
    private categoryService: CategoryService,
    private translate: TranslateService
  ) {}

  /**
   * Check if the current document direction is RTL
   * @returns boolean - true if RTL, false if LTR
   */
  isRTL(): boolean {
    // Method 1: Check document direction
    const docDir = document.documentElement.dir || document.body.dir;
    if (docDir) {
      return docDir.toLowerCase() === 'rtl';
    }

    // Method 2: Check computed style (fallback)
    const computedDirection = window.getComputedStyle(
      document.documentElement
    ).direction;
    return computedDirection === 'rtl';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryEditData'] && this.categoryEditData) {
      this.populateFormData();
    }
  }

  populateFormData(): void {
    const matchedUnit = this.unitOptions.find(
      (option) => option.name === this.categoryEditData.unit
    );

    this.categoryData = {
      id: this.categoryEditData.id,
      name: this.categoryEditData.name,
      parentCategoryId:
        this.categoryEditData.parentCategoryId !== null
          ? Number(this.categoryEditData.parentCategoryId)
          : null,
      unit: matchedUnit ? matchedUnit.id : null,
    };
  }

  resetForm(): void {
    this.categoryEditData = null;
    this.categoryData = {
      name: '',
      parentCategoryId: null,
      unit: null,
    };
  }

  updateCategory(): void {
    if (!this.categoryData.name || this.categoryData.unit === null) {
      this.translate
        .get([
          'CATEGORY-FORM.VALIDATION.TITLE',
          'CATEGORY-FORM.VALIDATION.REQUIRED_FIELDS',
        ])
        .subscribe((translations) => {
          Swal.fire({
            icon: 'error',
            title: translations['CATEGORY-FORM.VALIDATION.TITLE'],
            text: translations['CATEGORY-FORM.VALIDATION.REQUIRED_FIELDS'],
          });
        });
      return;
    }

    const payload = {
      ...this.categoryData,
      unit: Number(this.categoryData.unit), // send unit as id (number)
      parentCategoryId:
        this.categoryData.parentCategoryId !== null
          ? Number(this.categoryData.parentCategoryId)
          : null,
    };

    const serviceCall = this.categoryData.id
      ? this.categoryService.updateCategory(payload)
      : this.categoryService.createCategory(payload);

    const isEdit = !!this.categoryData.id;
    const successKey = isEdit
      ? 'CATEGORY-FORM.MESSAGES.UPDATE_SUCCESS'
      : 'CATEGORY-FORM.MESSAGES.CREATE_SUCCESS';

    serviceCall.subscribe({
      next: () => {
        this.translate
          .get(['CATEGORY-FORM.MESSAGES.SUCCESS_TITLE', successKey])
          .subscribe((translations) => {
            Swal.fire(
              translations['CATEGORY-FORM.MESSAGES.SUCCESS_TITLE'],
              translations[successKey],
              'success'
            );
            this.categoryUpdated.emit();
            if (!this.categoryData.id) this.resetForm();
          });
      },
      error: () => {
        this.translate
          .get([
            'CATEGORY-FORM.MESSAGES.ERROR_TITLE',
            'CATEGORY-FORM.MESSAGES.ERROR_MESSAGE',
          ])
          .subscribe((translations) => {
            Swal.fire(
              translations['CATEGORY-FORM.MESSAGES.ERROR_TITLE'],
              translations['CATEGORY-FORM.MESSAGES.ERROR_MESSAGE'],
              'error'
            );
          });
      },
    });
  }

  onOffcanvasHidden(): void {
    this.resetForm();
  }
}
