// Angular Core & Common Modules
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Third-Party Modules
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

// Custom Services & Components
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { LoaderComponent } from './components/loader/loader.component';
import { LanguageService } from '../../core/services/language.service';
import { RoleService } from '../../core/services/role.service';
import { AuthService } from '../../features/auth/services/auth.service';
import { MenuItem } from '../../core/models/menuItem.model';
import { AppNotification } from './models/notification';
import { DEFAULT_USER_IMAGE } from '../../core/constants/user.constants';
import { AttendanceService } from '../../shared/services/attendance.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    TranslateModule,
    FormsModule,
    NgbDropdownModule,
    SidebarComponent,
    HeaderComponent,
    LoaderComponent,
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss'],
})
export class DashboardLayoutComponent implements OnInit {
  // User Info
  userData: any;
  userName: string = '';
  userRole: string = '';
  userImageUrl: string = '';
  userImage: string = DEFAULT_USER_IMAGE;
  isSidebarActive = false;

  // Attendance Info
  userStatus: any;
  clockInTime: string = '';
  duration: string = '';
  isLoading: boolean = true;

  // UI States
  isProfileMenuOpen = false;
  isLanguageMenuOpen = false;
  expandedIndex: number | null = null;
  selectedLanguage: string = 'en';

  // Navigation Menu
  menuItems: MenuItem[] = [];

  // Notifications
  showUnreadOnly = false;
  notifications: AppNotification[] = [];

  // Footer Info
  currentYear = new Date().getFullYear();

  constructor(
    private roleService: RoleService,
    private router: Router,
    private authService: AuthService,
    private translate: TranslateService,
    private attendanceService: AttendanceService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.fetchUserProfile();
    this.getStatus();
    this.initializeMenu();
  }



  // Fetch user profile from API
  fetchUserProfile(): void {
    this.authService.getProfile().subscribe({
      next: (response) => {
        if (response?.succeeded && response?.data) {
          this.userData = response.data;
          this.userName = response.data.userName || '';
          this.userRole = response.data.role || '';
          this.userImageUrl = response.data.image || '';

          // Cache user info in localStorage
          localStorage.setItem(
            'user',
            JSON.stringify({
              userName: this.userName,
              role: this.userRole,
              image: this.userImageUrl,
              id: response.data.id,
            })
          );
        }
      },
      error: (error: any) => {
        console.error('Failed to fetch user profile:', error);
        Swal.fire({
          icon: 'error',
          title: 'User Profile Error',
          text: error?.error?.message || 'Failed to load user profile.',
        });
      },
    });
  }

  // Initialize menu without fetching profile again
  initializeMenu() {
    this.loadMenu();

    // Reload menu on language change
    this.translate.onLangChange.subscribe(() => {
      this.loadMenu();
    });
  }

  // Attendance Clock-In/Out
  onClockInOut() {
    this.clockAttendance();
  }

  getStatus() {
    this.attendanceService.getUserAttendanceStatus().subscribe({
      next: (res) => {
        this.isLoading = false;

        if (res?.message === 'Success') {
          const data = res.data;
          if (!data) {
            this.userStatus = 'not-started';
            this.clockInTime = 'Not Clocked In';
            this.duration = '';
          } else {
            if (data.clockIn && !data.clockOut) {
              this.userStatus = 'clock-in';
            } else if (data.clockOut && data.status === 'Completed') {
              this.userStatus = 'completed';
            } else {
              this.userStatus = 'working';
            }

            this.clockInTime = data.clockIn
              ? new Date(data.clockIn).toLocaleTimeString()
              : 'Not Clocked In';

            this.duration = data.duration
              ? this.formatDuration(data.duration)
              : '';
          }
        } else {
          this.userStatus = 'error';
          this.clockInTime = 'Not Available';
          this.duration = '';
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.userStatus = 'not-started';
        this.clockInTime = 'Not Clocked In';
        this.duration = '';
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: error?.error?.message || 'Failed to load attendance status.',
        });
      },
    });
  }

  formatDuration(duration: string): string {
    const [hours, minutes, seconds] = duration.split(':').map(Number);
    if (hours > 0) {
      return `${hours} hour${
        hours > 1 ? 's' : ''
      } ${minutes} min ${seconds} sec`;
    }
    if (minutes > 0) {
      return `${minutes} min ${seconds} sec`;
    }
    return `${seconds} sec`;
  }

  clockAttendance() {
    this.isLoading = true;
    this.attendanceService.clockUser().subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response?.success) {
          this.getStatus();
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: response?.message || 'Clock action completed successfully.',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Failed',
            text: response?.message || 'Clock action failed.',
          });
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Clock in/out error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Clock-in/Out Error',
          text: error?.error?.message || 'An unexpected error occurred.',
        });
      },
    });
  }

  loadMenu(): void {
    this.isLoading = true;
    this.roleService.getFilteredMenu().subscribe({
      next: (response) => {
        this.menuItems = [...(Array.isArray(response) ? response : [])];
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading menu:', error);
        this.menuItems = [];
        this.isLoading = false;
      },
    });
  }

  toggleSubmenu(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  hasChildren(item: MenuItem): boolean {
    return !!item?.children?.length;
  }

  trackByMenuItem(index: number, item: MenuItem): string {
    return item.label;
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  toggleLanguageMenu() {
    this.isLanguageMenuOpen = !this.isLanguageMenuOpen;
  }

  switchLanguage(language: string) {
    this.languageService.switchLanguage(language);
  }

  selectLanguage(language: string) {
    this.switchLanguage(language);
    this.isLanguageMenuOpen = false;
  }

  openSettings() {
    const userRole = this.userRole || this.roleService.getRole() || '';
    const routes: Record<string, string> = {
      Admin: 'admin/profile',
      Manager: 'manager/profile',
      Supervisor: 'supervisor/profile',
      Cleaner: 'cleaner/profile',
    };
    this.router.navigate([routes[userRole] || 'login']);
    this.toggleProfileMenu();
  }

  logOut() {
    this.authService.logout();
    this.router.navigate(['/public/login']);
  }

  toggleSidebar(): void {
    this.isSidebarActive = !this.isSidebarActive;
  }
}
