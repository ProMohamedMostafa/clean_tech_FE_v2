import { Injectable } from '@angular/core';
import { PdfStyleService } from './pdf-style.service';
import jsPDF from 'jspdf';
import { AttendanceReportConfig } from '../models/attendance-report.model';

@Injectable({ providedIn: 'root' })
export class PdfLayoutService {
  constructor(private style: PdfStyleService) {}

  addHeader(doc: jsPDF, title: string, pageWidth: number): number {
    doc.addImage(this.style.logo.url, 'PNG', 5, 10, 40, 12);

    doc.setFont(this.style.defaultStyling.font, 'bold');
    doc.setFontSize(12);
    doc.text(title, pageWidth - 5, 18, { align: 'right' });

    doc.setDrawColor(39, 174, 96);
    doc.line(0, 25, pageWidth, 25);

    return 30;
  }

  /**
   * Overloaded method for backward compatibility
   */
  addFooter(doc: jsPDF, pageWidth: number): void;
  addFooter(
    doc: jsPDF,
    pageWidth: number,
    currentPage?: number,
    pageCount?: number
  ): void {
    const y = doc.internal.pageSize.getHeight() - 8;

    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);

    // Calculate page numbers if not provided
    if (currentPage === undefined || pageCount === undefined) {
      // For backward compatibility with other services
      // This is a simplified version that may not be 100% accurate
      const totalPages = (doc as any).getNumberOfPages();
      const current = (doc as any).internal.getCurrentPageInfo().pageNumber;
      doc.text(`Page ${current}/${totalPages}`, pageWidth - 15, y, {
        align: 'right',
      });
    } else {
      // Use provided page numbers
      doc.text(`Page ${currentPage}/${pageCount}`, pageWidth - 15, y, {
        align: 'right',
      });
    }
  }

  addMetadata(
    doc: jsPDF,
    config: AttendanceReportConfig,
    pageWidth: number,
    startY: number
  ): void {
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);

    doc.text(
      `Report Date: ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      startY,
      {
        align: 'center',
      }
    );
  }
}
