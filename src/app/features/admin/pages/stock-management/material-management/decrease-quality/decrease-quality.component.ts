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
  selector: 'app-decrease-quality',
  imports: [FormsModule, TranslateModule],
  templateUrl: './decrease-quality.component.html',
  styleUrl: './decrease-quality.component.scss',
})
export class DecreaseQualityComponent implements AfterViewInit {
  successMessage = '';
  private modal: any | null = null;

  @Input() removenewMaterial: any;
  @Input() providers: any[] = [];
  @Output() addStockOut = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<void>();

  constructor(private stockService: StockService) {}

  ngAfterViewInit(): void {
    // Initialize and show the modal when component is loaded
    const modalElement = document.getElementById('minusModal');
    if (modalElement) {
      this.modal = new Modal(modalElement);
      this.modal.show();

      // Handle modal close events
      modalElement.addEventListener('hidden.bs.modal', () => {
        this.close.emit();
      });
    }
  }

  isFormValid(): boolean {
    return (
      !!this.removenewMaterial.Quantity && !!this.removenewMaterial.ProviderId
    );
  }

  submitForm(): void {
    if (!this.isFormValid()) {
      Swal.fire('Error', 'Please fill all required fields', 'error');
      return;
    }

    const payload = {
      materialId: this.removenewMaterial.MaterialId,
      providerId: Number(this.removenewMaterial.ProviderId),
      quantity: Number(this.removenewMaterial.Quantity),
    };

    this.stockService.addStockOut(payload).subscribe({
      next: (response) => {
        if (response) {
          this.successMessage = 'Stock reduced successfully!';
          Swal.fire('Success', 'Stock reduced successfully!', 'success');
          this.closeModal();
          this.addStockOut.emit(true);
          this.resetForm();
        } else {
          Swal.fire('Error', 'Failed to reduce stock', 'error');
        }
      },
      error: (error) => {
        console.error('Error reducing stock:', error);
        Swal.fire('Error', 'Failed to reduce stock', 'error');
      },
    });
  }

  closeModal(): void {
    if (this.modal) {
      this.modal.hide();
    }
  }

  private resetForm(): void {
    this.removenewMaterial = {
      MaterialId: this.removenewMaterial.MaterialId,
      ProviderId: 0,
      Quantity: 0,
    };
  }
}
