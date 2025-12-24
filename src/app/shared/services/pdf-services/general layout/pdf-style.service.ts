import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PdfStyleService {
  readonly defaultStyling = {
    primaryColor: [41, 128, 185] as [number, number, number],
    secondaryColor: [52, 152, 219] as [number, number, number],
    headerFontSize: 14,
    bodyFontSize: 9,
    font: 'helvetica' as 'helvetica' | 'times' | 'courier',
  };

  readonly logo = {
    url: 'assets/Clean-Tech-new.png',
    width: 60,
    height: 28,
  };

  readonly coverLogo = {
    url: 'assets/clean-tech-cover.png',
    width: 80,
    height: 38,
  };

  readonly coverImages = {
    topRight: 'assets/pdf-top-right-cover.png',
    bottomRight: 'assets/pdf-bottom-right-cover.png',
  };
}
