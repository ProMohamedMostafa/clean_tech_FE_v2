// src/app/presentation/components/admin-route/user-management/user-form/components/user-dropdown-section/user-dropdown-section.component.ts

import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-user-dropdown-section',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MatSelectModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
  ],
  templateUrl: './user-dropdown-section.component.html',
  styleUrl: './user-dropdown-section.component.scss',
})
export class UserDropdownSectionComponent implements OnDestroy {
  @Input() userForm!: FormGroup;
  @Input() isEditMode: boolean = false;
  @Input() countries: any[] = [];
  @Input() nationalities: any[] = []; // Add this property
  @Input() providers: any[] = [];
  @Input() roles: any[] = [];
  @Input() managers: any[] = [];
  @Input() trackByCountry!: (index: number, country: any) => any;
  @Input() trackByNationality!: (index: number, nationality: any) => any; // Add this
  @Input() trackByProvider!: (index: number, provider: any) => any;
  @Input() trackByRole!: (index: number, role: any) => any;
  @Input() trackByManager!: (index: number, manager: any) => any;
  @Input() trackByShift!: (index: number, shift: any) => any;

  @Output() roleChanged = new EventEmitter<Event>();

  private destroy$ = new Subject<void>();

  isLoading = false;

  ngOnInit(): void {
    console.log('📥 Inputs received in UserDropdownSectionComponent:');
    console.log('➡️ userForm:', this.userForm?.value);
    console.log('➡️ isEditMode:', this.isEditMode);
    console.log('➡️ countries:', this.countries);
    console.log('➡️ nationalities:', this.nationalities);
    console.log('➡️ providers:', this.providers);
    console.log('➡️ roles:', this.roles);
    console.log('➡️ managers:', this.managers);
  }

  ngOnChanges(changes: SimpleChanges): void {
  if (changes['managers']) {
    console.log('👥 managers updated:', this.managers);
  }
}


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onRoleChange(event: Event): void {
    this.roleChanged.emit(event);
  }

  isInvalid(field: string): boolean {
    const control = this.userForm.get(field);
    return !!(control && control.invalid && control.touched);
  }
}
