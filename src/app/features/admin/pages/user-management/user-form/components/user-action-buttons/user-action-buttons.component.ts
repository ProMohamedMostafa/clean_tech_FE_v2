// src/app/presentation/components/admin-route/user-management/user-form/components/user-action-buttons/user-action-buttons.component.ts

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-user-action-buttons',
  templateUrl: './user-action-buttons.component.html',
  styleUrls: ['./user-action-buttons.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule],
})
export class UserActionButtonsComponent {
  @Input() isSubmitting: boolean = false;
  @Input() saveButtonText: string = '';
  @Input() cancelButtonText: string = '';

  @Output() cancelClicked = new EventEmitter<void>();

  onCancel(): void {
    this.cancelClicked.emit();
  }
}

// user-action-buttons.component.html
/*

*/

// user-action-buttons.component.scss
/*

*/
