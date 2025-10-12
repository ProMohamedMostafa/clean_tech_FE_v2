import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { UserNationality } from '../../../features/admin/models/user.model';
import { DEFAULT_USER_DATA } from '../../../core/constants/user.constants';
import { CountryService } from '../../../features/admin/services/work-location/country.service';
import { textValidator } from '../../../core/helpers/text.validator';
import { emailValidator } from '../../../core/helpers/email.validator';
import { showSuccessAlert } from '../../../core/helpers/utils';
import { getUserId, getUserRole } from '../../../core/helpers/auth.helpers';
import { AuthService } from '../../../features/auth/services/auth.service';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, CommonModule],
})
export class ProfilePageComponent implements OnInit {
  userId: number | null = null;

  // Form and UI State
  userForm!: FormGroup;
  isSubmitting: boolean = false;
  isLoading: boolean = true;
  hasExistingImage: boolean = false;
  today: string = new Date().toISOString().split('T')[0];

  // Image Handling
  selectedImage: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  // Data Collections
  countries: UserNationality[] = [];

  // User Data
  userData: any = { ...DEFAULT_USER_DATA };

  constructor(
    private fb: FormBuilder,
    private countryService: CountryService,
    private location: Location,
    private router: Router,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    this.determineMode();
    this.initializeForms();
    await this.loadInitialData(); // wait for countries
    this.loadUserDetails(); // then load user
  }

  //#region Initialization

  /**
   * Determines the current user's ID for profile editing
   */
  private determineMode(): void {
    const userId = getUserId();
    this.userId = userId ? +userId : null;
  }

  /**
   * Initializes the reactive forms with validation rules
   */
  private initializeForms(): void {
    // Profile form
    this.userForm = this.fb.group({
      userName: [
        '',
        [
          Validators.required,
          textValidator(),
          Validators.minLength(3),
          Validators.maxLength(255),
        ],
      ],
      firstName: [
        '',
        [
          Validators.required,
          textValidator(),
          Validators.minLength(3),
          Validators.maxLength(255),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          textValidator(),
          Validators.minLength(3),
          Validators.maxLength(255),
        ],
      ],
      email: ['', [Validators.required, emailValidator()]],
      phoneNumber: [
        '',
        [
          Validators.required,
          textValidator(),
          Validators.minLength(10),
          Validators.maxLength(15),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      birthdate: [
        null,
        [Validators.required, this.futureDateValidator.bind(this)],
      ],
      gender: ['', Validators.required],
      idNumber: [
        '',
        [
          Validators.required,
          textValidator(),
          Validators.minLength(5),
          Validators.maxLength(20),
        ],
      ],
      nationalityName: ['', Validators.required],
      countryName: ['', Validators.required],
      image: [null],
    });
  }

  /**
   * Loads initial dropdown data (countries)
   */
  private loadInitialData(): Promise<void> {
    return new Promise((resolve) => {
      this.countryService.getNationalities().subscribe({
        next: (response) => {
          this.countries = Array.isArray(response?.data) ? response.data : [];
          resolve();
        },
        error: () => resolve(), // still resolve on error to continue safely
      });
    });
  }

  /**
   * Loads user details by ID and populates the form
   */
  private loadUserDetails(): void {
    this.authService.getProfile().subscribe({
      next: async (response) => {
        if (response) {
          await this.populateForm(response.data);
        }
        this.isLoading = false;
      },
    });
  }

  /**
   * Populates the form with user data
   */
  private async populateForm(user: any): Promise<void> {
    const nationality = this.countries.find(
      (c) =>
        c?.name?.trim().toLowerCase() ===
        (user?.nationalityName || '').trim().toLowerCase()
    );

    const country = this.countries.find(
      (c) =>
        c?.name?.trim().toLowerCase() ===
        (user?.countryName || '').trim().toLowerCase()
    );

    this.userForm.patchValue({
      userName: user?.userName || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      birthdate: this.formatDate(user?.birthdate || ''),
      idNumber: user?.idNumber || '',
      nationalityName: nationality?.name || user?.nationalityName || '',
      countryName: country?.name || user?.countryName || '',
      gender:
        user?.gender !== null && user?.gender !== undefined
          ? String(user.gender)
          : '',
    });

    this.syncFormToUserData();
    await this.handleUserImage(user);
  }

  /**
   * Handles loading and displaying the user's profile image
   */
  private async handleUserImage(user: any): Promise<void> {
    if (user.image) {
      this.hasExistingImage = true;
      this.imagePreview = user.image;
      this.selectedImage = null;
    } else {
      this.setDefaultImage();
    }
  }

  //#endregion

  //#region Form Utilities

  /**
   * Validates that a date is not in the future
   */
  futureDateValidator(control: AbstractControl) {
    if (!control.value) return null;
    const selectedDate = new Date(control.value);
    const todayDate = new Date();
    return selectedDate > todayDate ? { futureDate: true } : null;
  }

  /**
   * Checks if a form field is invalid and touched
   */
  isInvalid(field: string): boolean {
    const control = this.userForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Formats a date string to YYYY-MM-DD format
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';

    let date: Date;

    if (dateString.includes('/')) {
      const [month, day, year] = dateString.split('/').map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(dateString);
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Syncs reactive form values to userData object for template compatibility
   */
  private syncFormToUserData(): void {
    const formValues = this.userForm.value;
    this.userData = {
      ...this.userData,
      ...formValues,
    };
  }

  /**
   * Gets a human-readable field name for error messages
   */
  private getFieldName(key: string): string {
    const fieldNames: { [key: string]: string } = {
      userName: 'Username',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phoneNumber: 'Phone Number',
      birthdate: 'Birthdate',
      gender: 'Gender',
      idNumber: 'ID Number',
      nationalityName: 'Nationality',
      countryName: 'Country',
    };
    return fieldNames[key] || key;
  }

  //#endregion

  //#region Image Handling

  /**
   * Handles profile image selection
   */
  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.selectedImage = file;
    this.hasExistingImage = false;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
      const img = document.getElementById(
        'profileImagePreview'
      ) as HTMLImageElement;
      if (img && typeof reader.result === 'string') {
        img.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
    this.userData.image = file;
  }

  /**
   * Removes the selected image and resets to default
   */
  cancelImage(): void {
    this.selectedImage = null;
    this.userData.image = null;
    this.setDefaultImage();
  }

  /**
   * Sets the default profile image
   */
  private setDefaultImage(): void {
    this.imagePreview = '../assets/header-profile-image.svg';
    this.selectedImage = null;
    this.hasExistingImage = false;
  }

  /**
   * Programmatically triggers the file input click
   */
  triggerImageUpload(): void {
    document.getElementById('profileImageInput')?.click();
  }

  //#endregion

  //#region Form Submission

  /**
   * Handles form submission for profile update
   */
  async onSubmit(): Promise<void> {
    await this.updateProfile();
  }

/**
 * Updates the user profile
 */
private async updateProfile(): Promise<void> {
  if (this.userForm.invalid) {
    this.handleFormValidationErrors();
    return;
  }

  this.isSubmitting = true;

  const formData = this.createUpdateFormData();
  const userRole = getUserRole().toLowerCase(); // get the role

  this.authService.editUserProfile(formData).subscribe({
    next: (response) => {
      if (response.succeeded) {
        showSuccessAlert(
          response.message || 'Profile updated successfully!',
          () => {
            // Navigate based on role
            this.router.navigate([`/${userRole}/profile`]).then(() => {
              // Reload page after navigation
              window.location.reload();
            });
          }
        );
      }
      this.isSubmitting = false;
    },
    error: () => {
      this.isSubmitting = false;
    },
  });
}


  /**
   * Creates FormData object for profile update
   */
  private createUpdateFormData(): FormData {
    const formData = new FormData();
    const formValues = this.userForm.value;

    const fieldMapping: { [key: string]: string } = {
      firstName: 'FirstName',
      lastName: 'LastName',
      email: 'Email',
      phoneNumber: 'PhoneNumber',
      birthdate: 'Birthdate',
      gender: 'Gender',
      idNumber: 'IDNumber',
      nationalityName: 'NationalityName',
      countryName: 'CountryName',
    };

    Object.keys(formValues).forEach((key) => {
      if (key !== 'image') {
        const value = formValues[key];
        const mappedKey = fieldMapping[key] || key;
        formData.append(
          mappedKey,
          value !== null && value !== undefined ? value : ''
        );
      }
    });

    if (this.selectedImage) {
      formData.append('Image', this.selectedImage);
    } else if (!this.hasExistingImage) {
      formData.append('RemoveImage', 'true');
    }

    return formData;
  }

  /**
   * Handles form validation errors by showing all invalid fields
   */
  private handleFormValidationErrors(): void {
    this.userForm.markAllAsTouched();
    Swal.fire({
      icon: 'error',
      title: 'Form Error',
      html: `
        <div style="text-align: left;">
          <p>Please correct the following errors:</p>
          <ul>
            ${Object.keys(this.userForm.controls)
              .filter((key) => this.userForm.get(key)?.invalid)
              .map((key) => `<li>${this.getFieldName(key)} is invalid</li>`)
              .join('')}
          </ul>
        </div>
      `,
      confirmButtonColor: '#3f51b5',
    });
  }

  //#endregion

  //#region Navigation & Utilities

  /**
   * Navigates back to the previous page
   */
  cancel(): void {
    this.location.back();
  }

  /**
   * Gets the page title - always "Edit Profile" for profile page
   */
  get pageTitle(): string {
    return 'PROFILE.EDIT_TITLE';
  }

  /**
   * Gets the save button text
   */
  get saveButtonText(): string {
    return 'PROFILE.SAVE';
  }

  /**
   * Gets the cancel button text
   */
  get cancelButtonText(): string {
    return 'PROFILE.CANCEL';
  }

  //#endregion

  //#region Template Helper Methods

  /**
   * TrackBy function for countries dropdown optimization
   */
  trackByCountry(index: number, country: any): any {
    return country ? country.id || country.name : index;
  }

  //#endregion
}
