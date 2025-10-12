import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  constructor(private translate: TranslateService) {
    // Load saved language from localStorage or default to 'en'
    const savedLanguage = localStorage.getItem('language') || 'en';
    this.translate.setDefaultLang(savedLanguage);
    this.translate.use(savedLanguage);
    this.setDirection(savedLanguage);
  }

  // Function to switch language and direction globally
  switchLanguage(language: string) {
    this.translate.use(language);
    this.setDirection(language);

    // Save the selected language to localStorage
    localStorage.setItem('language', language);
  }

  // Set the text direction based on language (LTR or RTL)
  private setDirection(language: string) {
    const htmlElement = document.documentElement;

    if (language === 'ar' || language === 'ur') {
      htmlElement.setAttribute('dir', 'rtl'); // Right-to-Left direction
    } else {
      htmlElement.setAttribute('dir', 'ltr'); // Left-to-Right direction
    }
  }
}
