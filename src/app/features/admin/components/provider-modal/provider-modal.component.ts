import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  ElementRef,
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';
import { ProviderService } from '../../services/provider.service';

@Component({
  selector: 'app-provider-modal',
  templateUrl: './provider-modal.component.html',
  styleUrls: ['./provider-modal.component.css'],
  imports: [FormsModule, ReactiveFormsModule, TranslateModule], // Import ReactiveFormsModule
})
export class ProviderModalComponent implements OnInit {
  @Input() provider: any;
  @Input() isModalOpen: boolean = false;
  @Input() actionType: string = ''; // 'add', 'edit', or 'delete'
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() reloadProvidersEvent = new EventEmitter<void>(); // Emit event to reload providers list

  providerForm!: FormGroup;

  constructor(
    private fb: FormBuilder, // Inject FormBuilder for form creation
    private providerService: ProviderService,
    private elRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.providerForm = this.fb.group({
      id: [this.provider?.id || ''],
      name: [
        this.provider?.name || '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(255),
        ],
      ],
    });
  }
  ngAfterViewInit(): void {
    if (this.isModalOpen) {
      this.setFocusOnModal();
    }
  }

  // Ensure modal gets focus when opened
  private setFocusOnModal() {
    setTimeout(() => {
      const modalElement =
        this.elRef.nativeElement.querySelector('#customModal');
      if (modalElement) {
        modalElement.removeAttribute('aria-hidden'); // Remove aria-hidden when modal is open
        modalElement.focus();
      }
    });
  }
  // Close the modal
  closeModal() {
    this.isModalOpen = false;
    this.closeModalEvent.emit();
    setTimeout(() => {
      const modalElement =
        this.elRef.nativeElement.querySelector('#customModal');
      if (modalElement) {
        modalElement.setAttribute('aria-hidden', 'true'); // Reapply aria-hidden when closed
      }
    });
  }
  // Perform the action based on actionType (add, edit, or delete)
  performAction() {
    if (this.providerForm) {
      if (this.actionType === 'edit') {
        this.updateProviderData();
      } else if (this.actionType === 'delete') {
        this.deleteProvider();
      } else if (this.actionType === 'add') {
        this.addProvider();
      }
    } else {
      Swal.fire({
        title: 'Error!',
        text: 'Please correct the errors in the form before submitting.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  }

  // Add a new provider
  addProvider() {
    if (this.providerForm.valid) {
      this.providerService.createProvider(this.providerForm.value).subscribe(
        (response) => {
          Swal.fire({
            title: 'Success!',
            text: 'Provider has been added successfully.',
            icon: 'success',
            confirmButtonText: 'OK',
          });
          this.reloadProvidersEvent.emit(); // Reload providers after adding
          this.closeModal(); // Close the modal after success
        },
        (error) => {
          Swal.fire({
            title: 'Error!',
            text: 'There was an error adding the provider.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      );
    }
  }

  // Update existing provider
  updateProviderData() {
    console.log(this.providerForm);

    this.providerService
      .editProvider({ name: this.provider.name, id: this.provider.id })
      .subscribe(
        (response) => {
          Swal.fire({
            title: 'Success!',
            text: 'Provider has been updated successfully.',
            icon: 'success',
            confirmButtonText: 'OK',
          });
          this.reloadProvidersEvent.emit(); // Reload providers after editing
          this.closeModal(); // Close the modal after success
        },
        (error) => {
          Swal.fire({
            title: 'Error!',
            text: 'There was an error updating the provider.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      );
  }

  // Delete provider
  deleteProvider() {
    this.providerService.deleteProvider(this.provider.id).subscribe(
      (response) => {
        Swal.fire({
          title: 'Deleted!',
          text: 'Provider has been deleted successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
        });
        this.reloadProvidersEvent.emit(); // Reload providers after deleting
        this.closeModal(); // Close the modal after success
      },
      (error) => {
        Swal.fire({
          title: 'Error!',
          text: 'There was an error deleting the provider.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    );
  }
}
