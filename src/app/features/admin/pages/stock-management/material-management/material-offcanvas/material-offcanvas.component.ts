import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { MaterialService } from '../../../../services/stock-service/material.service';
import Offcanvas from 'bootstrap/js/dist/offcanvas';

@Component({
  selector: 'app-material-offcanvas',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './material-offcanvas.component.html',
  styleUrls: ['./material-offcanvas.component.scss'],
})
export class MaterialOffcanvasComponent {
  private _materialEditData: any = null;
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
  @Input()
  set materialEditData(value: any) {
    this._materialEditData = value;
    if (value) {
      this.populateFormData();
    }
  }
  get materialEditData(): any {
    return this._materialEditData;
  }

  @Input() categories: any[] = [];
  @Output() materialUpdated = new EventEmitter<void>();
  @ViewChild('offcanvasElement') offcanvasElement!: ElementRef;

  materialData: {
    id: number | null;
    name: string;
    minThreshold: number;
    categoryId: number | null;
    quantity: number;
    description: string;
  } = {
    id: null,
    name: '',
    minThreshold: 0,
    categoryId: null,
    quantity: 0,
    description: '',
  };

  constructor(private materialService: MaterialService) {}

  populateFormData(): void {
    if (!this.materialEditData) return;

    this.materialData = {
      id: this.materialEditData.id ?? null,
      name: this.materialEditData.name ?? '',
      minThreshold: this.materialEditData.minThreshold ?? 0,
      categoryId: this.materialEditData.categoryId
        ? Number(this.materialEditData.categoryId)
        : null,
      quantity: this.materialEditData.quantity ?? 0,
      description: this.materialEditData.description ?? '',
    };
  }

  resetForm(): void {
    this._materialEditData = null;
    this.materialData = {
      id: null,
      name: '',
      minThreshold: 0,
      categoryId: null,
      quantity: 0,
      description: '',
    };
  }

  updateMaterial(): void {
    if (!this.materialData.name || this.materialData.categoryId === null) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please fill in all required fields!',
      });
      return;
    }

    const payload = {
      id: this.materialData.id,
      name: this.materialData.name,
      minThreshold: Number(this.materialData.minThreshold),
      categoryId: Number(this.materialData.categoryId),
      description: this.materialData.description,
    };

    const serviceCall = this.materialData.id
      ? this.materialService.updateMaterial(payload)
      : this.materialService.createMaterial(payload);

    const successMessage = this.materialData.id
      ? 'Material updated successfully!'
      : 'Material added successfully!';

    serviceCall.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: successMessage,
          timer: 2000,
          showConfirmButton: false,
        });
        this.materialUpdated.emit();
        if (!this.materialData.id) this.resetForm();
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to save material. Please try again!',
        });
      },
    });
  }

  onOffcanvasHidden(): void {
    this.resetForm();
  }

  showOffcanvas() {
    const offcanvasElement = this.offcanvasElement.nativeElement;
    const offcanvas = new Offcanvas(offcanvasElement);
    offcanvas.show();
  }
}
