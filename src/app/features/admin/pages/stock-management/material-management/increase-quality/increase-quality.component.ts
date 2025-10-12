import {
  Component,
  EventEmitter,
  Input,
  Output,
  AfterViewInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { StockService } from '../../../../services/stock-service/stock.service';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-increase-quality',
  imports: [FormsModule, TranslateModule],
  templateUrl: './increase-quality.component.html',
  styleUrl: './increase-quality.component.scss',
})
export class IncreaseQualityComponent implements AfterViewInit {
  @Input() addnewMaterial: any;
  @Input() providers: any[] = [];
  @Output() addStockIn = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<void>();

  successMessage = '';
  selectedFileName = '';
  private modal: any | null = null;

  constructor(private stockService: StockService) {}

  ngAfterViewInit(): void {
    // Initialize and show the modal when component is loaded
    const modalElement = document.getElementById('addModal');
    if (modalElement) {
      this.modal = new Modal(modalElement);
      this.modal.show();

      // Handle modal close events
      modalElement.addEventListener('hidden.bs.modal', () => {
        this.close.emit();
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFileName = input.files[0].name;
      this.addnewMaterial.File = input.files[0];
    }
  }

  isFormValid(): boolean {
    return !!this.addnewMaterial.Quantity && !!this.addnewMaterial.ProviderId;
  }

  submitForm(): void {
    if (!this.isFormValid()) {
      Swal.fire('Error', 'Please fill all required fields', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('MaterialId', this.addnewMaterial.MaterialId);
    formData.append('ProviderId', this.addnewMaterial.ProviderId);
    formData.append('Quantity', this.addnewMaterial.Quantity);
    formData.append('Price', this.addnewMaterial.Price);
    if (this.addnewMaterial.File) {
      formData.append('File', this.addnewMaterial.File);
    }

    this.stockService.addStockIn(formData).subscribe({
      next: (response) => {
        if (response) {
          Swal.fire('Success', 'Stock added successfully!', 'success');
          this.closeModal();
          this.addStockIn.emit(true);
          this.resetForm();
        }
      },
      error: (error) => {
        console.error('Error adding stock:', error);
        Swal.fire('Error', 'Failed to add stock', 'error');
      },
    });
  }

  closeModal(): void {
    if (this.modal) {
      this.modal.hide();
    }
  }

  private resetForm(): void {
    this.addnewMaterial = {
      MaterialId: this.addnewMaterial.MaterialId,
      ProviderId: 0,
      Quantity: 0,
      Price: 0,
      File: null,
    };
    this.selectedFileName = '';
  }
}
