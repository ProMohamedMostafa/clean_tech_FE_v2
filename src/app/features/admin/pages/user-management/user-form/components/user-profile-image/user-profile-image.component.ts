// src/app/presentation/components/admin-route/user-management/user-form/components/user-profile-image/user-profile-image.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-user-profile-image',
  templateUrl: './user-profile-image.component.html',
  styleUrls: ['./user-profile-image.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule],
})
export class UserProfileImageComponent {
  @Input() isEditMode: boolean = false;
  @Input() imagePreview: string | ArrayBuffer | null = null;

  @Output() imageSelected = new EventEmitter<{
    file: File;
    preview: string | ArrayBuffer;
  }>();
  @Output() imageCanceled = new EventEmitter<void>();

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.imageSelected.emit({ file, preview: reader.result! });
    };
    reader.readAsDataURL(file);
  }

  triggerImageUpload(): void {
    document.getElementById('profileImageInput')?.click();
  }

  onCancelImage(): void {
    this.imageCanceled.emit();
  }
}
