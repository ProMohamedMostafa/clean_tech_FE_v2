import { Injectable } from '@angular/core';
import { PdfCoverService } from '../general layout/pdf-cover.service';
import { PdfLayoutService } from '../general layout/pdf-layout.service';
import { PdfStyleService } from '../general layout/pdf-style.service';
import { StockPdfService } from './stock-pdf.service';
import { StockReportConfig } from '../models/stock-report.model';
import { TableStyleService } from '../general layout/table-style.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({ providedIn: 'root' })
export class StockReportService {
  constructor(
    private cover: PdfCoverService,
    private layout: PdfLayoutService,
    private style: PdfStyleService,
    private pdf: StockPdfService,
    private tableStyle: TableStyleService
  ) {}

  generatePDF(config: StockReportConfig): void {
    const doc = new jsPDF();
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
        const marginX = 5;


    // ---------------- Cover Page ----------------
    if (config.includeCoverPage !== false) {
      this.cover.addCover(doc, config as any, width, height);
      doc.addPage();
    }

    // ---------------- Header ----------------
    const startY = this.layout.addHeader(
      doc,
      config.pdfTitle || 'Stock Report',
      width
    );

    // ---------------- Metadata ----------------
    this.layout.addMetadata(doc, config as any, width, startY);

    // ---------------- Table ----------------
    autoTable(doc, {
      startY: startY + 15,
       margin: {
        left: marginX,
        right: marginX,
      },
      tableWidth: width - marginX * 2,

      head: [config.headers],
      body: this.pdf.prepareTable(config),
      styles: this.tableStyle.getDefaultStyles(),
      headStyles: this.tableStyle.getHeadStyles(),
      alternateRowStyles: this.tableStyle.getAlternateRowStyles(),
      columnStyles: this.tableStyle.getColumnStyles(),
      didDrawPage: () => {
        this.layout.addHeader(doc, config.pdfTitle || '', width);
        this.layout.addFooter(doc, width);
      },
    });

    doc.save(`${config.fileName}.pdf`);
  }
}
