import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { LanguageService } from '../../../../core/services/language.service';
import { AuthService } from '../../../../features/auth/services/auth.service';
import { NotificationComponent } from '../notification/notification.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [TranslateModule, CommonModule, NotificationComponent],
})
export class HeaderComponent {
  // Header inputs
  @Input() userImage: string = '';
  @Input() userName: string = '';
  @Input() userRole: string = '';
  @Input() selectedLanguage: string = 'en';
  @Output() toggleSidebar = new EventEmitter<void>();

  // Attendance status inputs
  @Input() attendanceStatus: string = '';
  @Input() userStatus: string = '';
  @Input() clockInTime: string = ''; // UTC string from API
  @Input() clockOutTime: string = ''; // UTC string from API (nullable)
  @Input() duration: string = '';
  @Input() isLoading: boolean = false;
  @Output() clockInOut = new EventEmitter<void>();

  isProfileMenuOpen = false;
  isLanguageMenuOpen = false;

  constructor(
    private router: Router,
    private languageService: LanguageService,
    public translate: TranslateService,
    private authService: AuthService
  ) {}

  getLocalTime(serverTime: string): string {
    console.log('👉 Raw input from API:', serverTime);

    if (!serverTime) return '';

    // Clean input
    const cleaned = serverTime.trim();
    console.log('👉 Cleaned time string:', cleaned);

    // 🔹 Parse 12-hour time (e.g., "1:38:02 PM") → 24-hour (e.g., "13:38:02")
    const match = cleaned.match(/(\d{1,2}):(\d{2}):(\d{2})\s?(AM|PM)/i);
    if (!match) {
      console.error('❌ Could not parse time string:', cleaned);
      return '';
    }

    let [_, h, m, s, period] = match;
    let hours = parseInt(h, 10);
    const minutes = parseInt(m, 10);
    const seconds = parseInt(s, 10);

    if (period.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;

    const hh = hours.toString().padStart(2, '0');
    const mm = minutes.toString().padStart(2, '0');
    const ss = seconds.toString().padStart(2, '0');

    const todayDate = new Date().toISOString().split('T')[0]; // e.g. 2025-09-15
    const utcString = `${todayDate}T${hh}:${mm}:${ss}Z`;
    console.log('👉 Converted to UTC string:', utcString);

    const date = new Date(utcString);
    console.log('👉 Parsed Date object:', date);

    if (isNaN(date.getTime())) {
      console.error('❌ Invalid Date for:', utcString);
      return '';
    }

    // Format as local time
    const local = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    console.log('✅ Local time:', local);
    return local;
  }

  get currentLanguage(): string {
    return this.translate.currentLang || 'en';
  }

  toggleLanguageMenu() {
    this.isLanguageMenuOpen = !this.isLanguageMenuOpen;
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  selectLanguage(language: string) {
    this.languageService.switchLanguage(language);
    this.isLanguageMenuOpen = false;
  }

  openProfile() {
    const route = this.authService.getProfileRoute(this.userRole);
    this.router.navigate([route]);
    this.isProfileMenuOpen = false;
  }

  logOut() {
    this.authService.logout();
  }
}
