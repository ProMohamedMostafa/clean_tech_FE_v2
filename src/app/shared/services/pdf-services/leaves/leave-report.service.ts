import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { LeavePdfService } from './leave-pdf.service';
import { LeaveReportConfig } from '../models/leave-report.model';
import { PdfCoverService } from '../general layout/pdf-cover.service';
import { PdfLayoutService } from '../general layout/pdf-layout.service';
import { PdfStyleService } from '../general layout/pdf-style.service';
import { TableStyleService } from '../general layout/table-style.service';

@Injectable({ providedIn: 'root' })
export class LeaveReportService {
  constructor(
    private cover: PdfCoverService,
    private layout: PdfLayoutService,
    private leavePdf: LeavePdfService,
    private style: PdfStyleService,
    private tableStyle: TableStyleService
  ) {}

  generateLeavePDF(config: LeaveReportConfig): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 5;

    // ---------------- Cover Page ----------------
    if (config.includeCoverPage !== false) {
      this.cover.addCover(doc, config as any, pageWidth, pageHeight);
      doc.addPage();
    }

    // ---------------- Header ----------------
    const startY = this.layout.addHeader(
      doc,
      config.pdfTitle || 'Leave Report',
      pageWidth
    );

    // ---------------- Metadata ----------------
    this.layout.addMetadata(doc, config as any, pageWidth, startY);

    // ---------------- Table ----------------
    autoTable(doc, {
      startY: startY + 15,
      margin: {
        left: marginX,
        right: marginX,
      },
      tableWidth: pageWidth - marginX * 2,

      head: [config.headers],
      body: this.leavePdf.prepareTable(config),
      styles: this.tableStyle.getDefaultStyles(), // Default cell styles
      headStyles: this.tableStyle.getHeadStyles(), // Header styles
      alternateRowStyles: this.tableStyle.getAlternateRowStyles(), // Alternating row colors
      columnStyles: this.tableStyle.getColumnStyles(), // Column-specific styles
      didDrawPage: () => {
        this.layout.addHeader(doc, config.pdfTitle || '', pageWidth);
        this.layout.addFooter(doc, pageWidth);
      },
    });

    doc.save(`${config.fileName}.pdf`);
  }
}
