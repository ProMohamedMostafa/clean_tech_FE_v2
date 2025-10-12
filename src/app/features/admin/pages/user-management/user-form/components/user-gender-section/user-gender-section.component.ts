// src/app/presentation/components/admin-route/user-management/user-form/components/user-gender-section/user-gender-section.component.ts

import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-user-gender-section',
  templateUrl: './user-gender-section.component.html',
  styleUrls: ['./user-gender-section.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, ReactiveFormsModule],
})
export class UserGenderSectionComponent {
  @Input() userForm!: FormGroup;
  @Input() isEditMode: boolean = false;

  isInvalid(field: string): boolean {
    const control = this.userForm.get(field);
    return !!(control && control.invalid && control.touched);
  }
}

// user-gender-section.component.html
/*

*/

// user-gender-section.component.scss
/*

*/
