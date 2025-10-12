// src/app/presentation/components/admin-route/user-management/user-form/components/user-personal-info/user-personal-info.component.ts

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-user-personal-info',
  templateUrl: './user-personal-info.component.html',
  styleUrls: ['./user-personal-info.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, ReactiveFormsModule],
})
export class UserPersonalInfoComponent implements OnInit {
  @Input() userForm!: FormGroup;
  @Input() isEditMode: boolean = false;
  @Input() today: string = '';
  @Input() showPassword: boolean = false;
  @Input() showConfirmPassword: boolean = false;

  @Output() showPasswordToggle = new EventEmitter<void>();
  @Output() showConfirmPasswordToggle = new EventEmitter<void>();

  ngOnInit(): void {
    if (this.userForm) {
      // 🔹 Log on every change
      this.userForm.valueChanges.subscribe((val) => {
        console.log('🔹 Current User Form Data:', val);
      });
    }
  }

  isInvalid(field: string): boolean {
    const control = this.userForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  onShowPasswordToggle(): void {
    this.showPasswordToggle.emit();
  }

  onShowConfirmPasswordToggle(): void {
    this.showConfirmPasswordToggle.emit();
  }


}
