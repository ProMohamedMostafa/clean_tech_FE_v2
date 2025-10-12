// src/app/presentation/components/admin-route/user-management/user-form/user-form.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs'; // Add this import

// Core Constants & Utilities
import { DEFAULT_USER_DATA } from '../../../../../core/constants/user.constants';
import { ROLE_ID_MAP } from '../../../../../core/constants/role.constants';
import { UserFormFactory } from '../../../../../core/factories/user-form.factory';
import { UserMapper } from '../../../../../core/mappers/user.mapper';

// Core Services
import { AlertService } from '../../../../../core/services/alert.service';
import { UserFormDataService } from '../../../../../core/services/user-form-data.service';
import { UserService } from '../../../services/user.service';

// Form Components
import { UserFormHeaderComponent } from './components/user-form-header/user-form-header.component';
import { UserProfileImageComponent } from './components/user-profile-image/user-profile-image.component';
import { UserPersonalInfoComponent } from './components/user-personal-info/user-personal-info.component';
import { UserGenderSectionComponent } from './components/user-gender-section/user-gender-section.component';
import { UserDropdownSectionComponent } from './components/user-dropdown-section/user-dropdown-section.component';
import { UserActionButtonsComponent } from './components/user-action-buttons/user-action-buttons.component';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    CommonModule,
    UserFormHeaderComponent,
    UserProfileImageComponent,
    UserPersonalInfoComponent,
    UserGenderSectionComponent,
    UserDropdownSectionComponent,
    UserActionButtonsComponent,
  ],
})
export class UserFormComponent implements OnInit {
  /** -------------------------
   *  Component State
   * ------------------------- */
  isEditMode = false;
  userId: number | null = null;
  userForm!: FormGroup;
  isSubmitting = false;
  isLoading = true;
  passwordsDoNotMatch = false;
  hasExistingImage = false;
  showPassword = false;
  showConfirmPassword = false;
  today = new Date().toISOString().split('T')[0];

  /** -------------------------
   *  Image Handling
   * ------------------------- */
  selectedImage: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  /** -------------------------
   *  Data Collections
   * ------------------------- */
  managers: any[] = [];
  countries: any[] = [];
  nationalities: any[] = [];
  providers: any[] = [];
  roles: any[] = [];

  /** -------------------------
   *  User Data
   * ------------------------- */
  userData: any = { ...DEFAULT_USER_DATA };

  /** -------------------------
   *  Field Labels (for validation errors)
   * ------------------------- */
  private readonly fieldNames: Record<string, string> = {
    userName: 'Username',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phoneNumber: 'Phone Number',
    password: 'Password',
    passwordConfirmation: 'Password Confirmation',
    birthdate: 'Birthdate',
    gender: 'Gender',
    idNumber: 'ID Number',
    nationalityName: 'Nationality',
    countryName: 'Country',
    roleId: 'Role',
    managerId: 'Manager',
    providerId: 'Provider',
  };

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private userFormDataService: UserFormDataService,
    private alertService: AlertService,
    private location: Location,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  /** -------------------------
   *  Lifecycle Hook
   * ------------------------- */
  ngOnInit(): void {
    this.determineMode();
    this.initializeForm();

    if (this.isEditMode && this.userId) {
      // Load both initial data and user details together for edit mode
      this.loadDataForEditMode();
    } else {
      // For create mode, just load initial data
      this.loadInitialDataForCreateMode();
    }
  }

  /** -------------------------
   *  Initialization Methods
   * ------------------------- */

  private determineMode(): void {
    const userId = this.route.snapshot.params['id'];
    this.isEditMode = !!userId;
    this.userId = userId ? +userId : null;
  }

  private initializeForm(): void {
    this.userForm = UserFormFactory.createForm(this.fb, this.isEditMode);
  }

  // NEW METHOD: Load data for edit mode (both initial data and user details)
  private loadDataForEditMode(): void {
    const initialData$ = this.userFormDataService.loadInitialData();
    const userDetails$ = this.userService.getUserById(this.userId!);

    forkJoin({
      initialData: initialData$,
      userDetails: userDetails$,
    })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: ({ initialData, userDetails }) => {
          // First set the dropdown data
          this.setDropdownData(initialData);

          // Then populate the form with user data
          if (userDetails) {
            this.populateFormWithUserData(userDetails);
          } else {
            this.alertService.error('Failed to load user details.');
          }
        },
        error: (error) => {
          console.error('Error loading data:', error);
          this.alertService.error('Error loading data. Please try again.');
        },
      });
  }

  // NEW METHOD: Load data for create mode
  private loadInitialDataForCreateMode(): void {
    this.userFormDataService.loadInitialData().subscribe({
      next: (data) => {
        this.setDropdownData(data);
        this.setDefaultImage();
        this.isLoading = false;
      },
      error: (error) => {
        this.alertService.error('Failed to load initial data');
        console.error(error);
        this.isLoading = false;
      },
    });
  }

  // NEW METHOD: Set dropdown data
  private setDropdownData(data: any): void {
    this.countries = data.countries || [];
    this.providers = data.providers || [];
    this.roles = data.roles || [];

    // Generate nationalities from countries if not provided
    this.nationalities =
      data.nationalities ||
      this.generateNationalitiesFromCountries(this.countries);

    console.log('🔍 Dropdown data set:', {
      countries: this.countries.length,
      nationalities: this.nationalities.length,
      providers: this.providers.length,
      roles: this.roles.length,
    });
  }

  private generateNationalitiesFromCountries(countries: any[]): any[] {
    return countries.map((country) => ({
      id: country.id,
      name: country.name,
      code: country.code || country.name.toLowerCase(),
    }));
  }

  /** -------------------------
   *  User Data Handling (UPDATED)
   * ------------------------- */

  // UPDATED METHOD: Populate form fields with user data
  private async populateFormWithUserData(user: any): Promise<void> {
    console.log('👤 User data received:', user);
    console.log('🗺️ Available nationalities:', this.nationalities);

    // Load managers based on user's role
    if (user.roleId) {
      await this.loadUsersByRole(user.roleId);
    }

    // Ensure nationality exists in the list (case-insensitive check)
    this.ensureNationalityExists(user.nationalityName);

    // Map user data to form format
    const formData = UserMapper.toForm(user);

    console.log('📝 Form data to populate:', formData);

    // Populate the form
    this.userForm.patchValue(formData);

    // Handle user image
    await this.handleUserImage(user);

    // Log final form state
    console.log('✅ Form populated. Final form value:', this.userForm.value);
    console.log(
      '✅ Nationality control value:',
      this.userForm.get('nationalityName')?.value
    );
  }

  // NEW METHOD: Ensure nationality exists in the dropdown list
  private ensureNationalityExists(nationalityName: string): void {
    if (!nationalityName) return;

    // Check if nationality already exists (case-insensitive)
    const existingNationality = this.nationalities.find(
      (n) => n.name.toLowerCase() === nationalityName.toLowerCase()
    );

    if (!existingNationality) {
      // Add the missing nationality to the list
      const newNationality = {
        id: this.nationalities.length + 1000, // Use a high ID to avoid conflicts
        name: nationalityName,
        code: nationalityName.toLowerCase(),
      };

      this.nationalities.push(newNationality);
      console.log(`➕ Added missing nationality: ${nationalityName}`);
    } else {
      console.log(
        `✅ Nationality "${nationalityName}" already exists in dropdown`
      );
    }
  }

  // Handle user image (existing or default)
  private async handleUserImage(user: any): Promise<void> {
    if (user.image) {
      this.hasExistingImage = true;
      this.imagePreview = user.image;
      this.selectedImage = null;
    } else {
      this.setDefaultImage();
    }
  }

  /** -------------------------
   *  Image Upload Handling
   * ------------------------- */

  onImageSelect(imageData: {
    file: File;
    preview: string | ArrayBuffer;
  }): void {
    this.selectedImage = imageData.file;
    this.imagePreview = imageData.preview;
    this.hasExistingImage = false;
    this.userData.image = imageData.file;
  }

  cancelImage(): void {
    this.selectedImage = null;
    this.userData.image = null;
    this.setDefaultImage();
  }

  private setDefaultImage(): void {
    this.imagePreview = '../assets/header-profile-image.svg';
    this.selectedImage = null;
    this.hasExistingImage = false;
  }

  /** -------------------------
   *  Role & Manager Handling
   * ------------------------- */

  async onRoleChange(event: Event): Promise<void> {
    const select = event.target as HTMLSelectElement;
    const roleName = select.options[select.selectedIndex]?.text ?? '';
    const roleId = ROLE_ID_MAP[roleName] ?? -1;

    if (roleId === -1) {
      this.alertService.error('Invalid role selected');
      return;
    }

    await this.loadUsersByRole(roleId);
  }

  private async loadUsersByRole(roleId: number): Promise<void> {
    try {
      const users = await this.userService.getUsersByRole(roleId);
      this.managers = users || [];
      console.log(users);
      
      console.log(
        `👥 Loaded ${this.managers.length} managers for role ${roleId}`
      );
    } catch {
      this.alertService.error('Failed to load managers');
      this.managers = [];
    }
  }

  /** -------------------------
   *  Form Submission
   * ------------------------- */

  async onSubmit(): Promise<void> {
    console.log('🚀 Submitting Full Form Data:', this.userForm.value);

    if (this.userForm.invalid) {
      this.handleFormValidationErrors();
      return;
    }

    if (!this.validatePasswords()) return;

    this.isSubmitting = true;

    try {
      this.isEditMode ? await this.updateUser() : await this.createUser();
    } catch {
      this.alertService.error('Unexpected error occurred');
    } finally {
      this.isSubmitting = false;
    }
  }

  private async createUser(): Promise<void> {
    const formValues = { ...this.userForm.value };

    if (this.selectedImage) {
      formValues.image = this.selectedImage;
    }

    console.log('🚀 Form values before mapping:', formValues);

    const formData = UserMapper.toCreatePayload(formValues);

    console.log('✅ FormData created successfully');

    this.userService.createUser(formData).subscribe({
      next: () =>
        this.alertService.success('User created successfully!', () =>
          this.router.navigate(['/admin/user-management'])
        ),
      error: (error) => this.handleCreateUserError(error),
    });
  }

  private async updateUser(): Promise<void> {
    const formData = UserMapper.toUpdatePayload(
      this.userForm.value,
      this.userId!,
      this.selectedImage,
      this.hasExistingImage
    );

    this.userService.editUser(formData).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.alertService.success(
            response.message || 'User updated successfully!',
            () => this.router.navigate(['/admin/user-management'])
          );
        } else {
          this.alertService.error(response.message || 'Failed to update user');
        }
      },
      error: (error) => this.handleUpdateError(error),
    });
  }

  /** -------------------------
   *  Validation & Error Handling
   * ------------------------- */

  private validatePasswords(): boolean {
    const password = this.userForm.get('password')?.value;
    const confirm = this.userForm.get('passwordConfirmation')?.value;

    if (password && password !== confirm) {
      this.passwordsDoNotMatch = true;
      this.alertService.error('Passwords do not match');
      return false;
    }

    this.passwordsDoNotMatch = false;
    return true;
  }

  private handleFormValidationErrors(): void {
    this.userForm.markAllAsTouched();
    const invalidFields = Object.keys(this.userForm.controls).filter(
      (key) => this.userForm.get(key)?.invalid
    );
    this.alertService.formErrors(invalidFields, this.fieldNames);
  }

  private handleCreateUserError(error: any): void {
    if (error.status === 400 && error.error?.errors) {
      this.alertService.validation(error.error.errors);
    } else {
      this.alertService.error(
        error.message || 'Failed to create user. Please try again later.'
      );
    }
  }

  private handleUpdateError(error: any): void {
    if (error.status === 400) {
      error.error?.errors
        ? this.alertService.validation(error.error.errors)
        : this.alertService.error(error.error?.message || 'Invalid form data');
    } else {
      this.alertService.error(
        error.message || 'Failed to update user. Please try again later.'
      );
    }
  }

  /** -------------------------
   *  Utility Methods
   * ------------------------- */

  cancel(): void {
    this.location.back();
  }

  /** -------------------------
   *  UI Helpers
   * ------------------------- */

  get pageTitle(): string {
    return this.isEditMode ? 'EditUser.TITLE' : 'AddUser.TITLE';
  }

  get saveButtonText(): string {
    return this.isEditMode ? 'EditUser.SAVE' : 'AddUser.SAVE';
  }

  get cancelButtonText(): string {
    return this.isEditMode ? 'EditUser.CANCEL' : 'AddUser.CANCEL';
  }

  /** TrackBy functions */
  trackByCountry(index: number, country: any): any {
    return country ? country.id || country.name : index;
  }
  trackByProvider(index: number, provider: any): any {
    return provider ? provider.id : index;
  }
  trackByRole(index: number, role: any): any {
    return role ? role.value : index;
  }
  trackByManager(index: number, manager: any): any {
    return manager ? manager.id : index;
  }
  trackByShift(index: number, shift: any): any {
    return shift ? shift.id : index;
  }
  trackByNationality(index: number, nationality: any): any {
    return nationality ? nationality.id || nationality.name : index;
  }
}
