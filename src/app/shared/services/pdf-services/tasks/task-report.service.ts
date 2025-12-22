import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { PdfCoverService } from '../general layout/pdf-cover.service';
import { PdfLayoutService } from '../general layout/pdf-layout.service';
import { PdfStyleService } from '../general layout/pdf-style.service';
import { TableStyleService } from '../general layout/table-style.service';

import { TaskPdfService } from './task-pdf.service';
import { TaskReportConfig } from '../models/task-report.model';

@Injectable({ providedIn: 'root' })
export class TaskReportService {
  constructor(
    private cover: PdfCoverService,
    private layout: PdfLayoutService,
    private taskPdf: TaskPdfService,
    private style: PdfStyleService,
    private tableStyle: TableStyleService
  ) {}

  generateTaskPDF(config: TaskReportConfig): void {
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
      config.pdfTitle || 'Task Report',
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
      body: this.taskPdf.prepareTable(config),
      styles: this.tableStyle.getDefaultStyles(),
      headStyles: this.tableStyle.getHeadStyles(),
      alternateRowStyles: this.tableStyle.getAlternateRowStyles(),
      columnStyles: this.tableStyle.getColumnStyles(),
      didDrawPage: () => {
        this.layout.addHeader(doc, config.pdfTitle || 'Task Report', pageWidth);
        this.layout.addFooter(doc, pageWidth);
      },
    });

    doc.save(`${config.fileName}.pdf`);
  }
}
