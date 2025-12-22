import { Injectable } from '@angular/core';
import { PdfStyleService } from './pdf-style.service';
import jsPDF from 'jspdf';
import { AttendanceReportConfig } from '../models/attendance-report.model';

@Injectable({ providedIn: 'root' })
export class PdfCoverService {
  constructor(private style: PdfStyleService) {}

  addCover(
    doc: jsPDF,
    config: AttendanceReportConfig,
    pageWidth: number,
    pageHeight: number
  ): void {
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    doc.addImage(this.style.coverLogo.url, 'PNG', 0, 0, 100, 50);

    doc.addImage(
      this.style.coverImages.topRight,
      'PNG',
      pageWidth - 60,
      0,
      60,
      80
    );

    const centerX = pageWidth / 2;
    let y = pageHeight / 2 - 30;

    doc.setFont(this.style.defaultStyling.font, 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...this.style.defaultStyling.primaryColor);

    doc.text(
      config.coverPageConfig?.title || config.pdfTitle || ' Report',
      centerX,
      y,
      { align: 'center' }
    );

    y += 20;

    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text(config.coverPageConfig?.subtitle || '', centerX, y, {
      align: 'center',
    });

    doc.addImage(
      this.style.coverImages.bottomRight,
      'PNG',
      pageWidth - 100,
      pageHeight - 120,
      100,
      120
    );
  }
}
