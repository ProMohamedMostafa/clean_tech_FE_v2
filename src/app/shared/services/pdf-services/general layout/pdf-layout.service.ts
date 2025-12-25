import { Injectable } from '@angular/core';
import { PdfStyleService } from './pdf-style.service';
import jsPDF from 'jspdf';

@Injectable({ providedIn: 'root' })
export class PdfLayoutService {
  readonly HEADER_HEIGHT = 30;
  readonly FOOTER_HEIGHT = 15;

  constructor(private style: PdfStyleService) {}
  /**
   * Draw header with title centered and optional multi-line date range on the right
   */
  addHeader(
    doc: jsPDF,
    title: string,
    pageWidth: number,
    fromDate?: string,
    toDate?: string
  ): number {
    // Logo on the left
    doc.addImage(this.style.logo.url, 'PNG', 5, 10, 40, 12);

    // Title in center
    doc.setFont(this.style.defaultStyling.font, 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(title, pageWidth / 2, 18, { align: 'center' });

    const rightEdge = pageWidth - 5;
    const fontSize = 9;
    const spacing = 3;

    // =========================
    // FROM line
    // =========================
    if (fromDate) {
      doc.setFontSize(fontSize);

      const fromLabel = 'From:';
      doc.setFont(this.style.defaultStyling.font, 'normal');
      const labelWidth = doc.getTextWidth(fromLabel);
      const dateWidth = doc.getTextWidth(fromDate);

      const startX = rightEdge - (labelWidth + spacing + dateWidth);

      // Label (gray)
      doc.setTextColor(60, 60, 60);
      doc.text(fromLabel, startX, 16);

      // Date (blue #025d8d)
      doc.setFont(this.style.defaultStyling.font, 'bold');
      doc.setTextColor(2, 93, 141); // 👈 #025d8d
      doc.text(fromDate, startX + labelWidth + spacing, 16);
    }

    // =========================
    // TO line
    // =========================
    if (toDate) {
      doc.setFontSize(fontSize);

      const toLabel = 'To:';
      doc.setFont(this.style.defaultStyling.font, 'normal');
      const labelWidth = doc.getTextWidth(toLabel);
      const dateWidth = doc.getTextWidth(toDate);

      const startX = rightEdge - (labelWidth + spacing + dateWidth);

      // Label (gray)
      doc.setTextColor(60, 60, 60);
      doc.text(toLabel, startX, 22);

      // Date (blue #025d8d)
      doc.setFont(this.style.defaultStyling.font, 'bold');
      doc.setTextColor(2, 93, 141); // 👈 #025d8d
      doc.text(toDate, startX + labelWidth + spacing, 22);
    }

    // Green line below header
    doc.setDrawColor(39, 174, 96);
    doc.line(0, 25, pageWidth, 25);

    return this.HEADER_HEIGHT;
  }

  addFooter(
    doc: jsPDF,
    pageWidth: number,
    currentPage: number,
    pageCount: number
  ): void {
    const y = doc.internal.pageSize.getHeight() - 8;
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Page ${currentPage}/${pageCount}`, pageWidth - 15, y, {
      align: 'right',
    });
  }

  /**
   * Apply header + footer to all pages except cover
   */
  applyHeaderFooterToAllPages(
    doc: jsPDF,
    title: string,
    pageWidth: number,
    fromDate?: string,
    toDate?: string
  ): void {
    const totalPages = (doc as any).getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      // Skip cover page
      if (i === 1) continue;

      this.addHeader(doc, title, pageWidth, fromDate, toDate);
      this.addFooter(doc, pageWidth, i - 1, totalPages - 1);
    }
  }
}
