// src/app/presentation/components/admin-route/user-management/user-form/components/user-form-header/user-form-header.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-user-form-header',
  templateUrl: './user-form-header.component.html',
  styleUrls: ['./user-form-header.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule],
})
export class UserFormHeaderComponent {
  @Input() pageTitle: string = '';
}

// user-form-header.component.html
/*

*/

// user-form-header.component.scss
/*

*/
