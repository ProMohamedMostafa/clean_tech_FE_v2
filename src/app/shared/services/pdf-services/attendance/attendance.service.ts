import { Injectable } from '@angular/core';
import { PdfCoverService } from '../general layout/pdf-cover.service';
import { PdfLayoutService } from '../general layout/pdf-layout.service';
import { AttendancePdfService } from './attendance-pdf.service';
import { PdfStyleService } from '../general layout/pdf-style.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AttendanceReportConfig } from '../models/attendance-report.model';
import { TableStyleService } from '../general layout/table-style.service';

@Injectable({ providedIn: 'root' })
export class AttendanceReportService {
  constructor(
    private cover: PdfCoverService,
    private layout: PdfLayoutService,
    private attendance: AttendancePdfService,
    private style: PdfStyleService,
    private tableStyle: TableStyleService
  ) {}

  generateAttendancePDF(config: AttendanceReportConfig): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 5;

    if (config.includeCoverPage !== false) {
      this.cover.addCover(doc, config, pageWidth, pageHeight);
      doc.addPage();
    }

    const startY = this.layout.addHeader(
      doc,
      config.pdfTitle || 'Attendance Report',
      pageWidth
    );

    this.layout.addMetadata(doc, config, pageWidth, startY);

    autoTable(doc, {
      startY: startY + 15,

      margin: {
        left: marginX,
        right: marginX,
      },
      tableWidth: pageWidth - marginX * 2,

      head: [config.headers],
      body: this.attendance.prepareTable(config),
      styles: this.tableStyle.getDefaultStyles(),
      headStyles: this.tableStyle.getHeadStyles(),
      alternateRowStyles: this.tableStyle.getAlternateRowStyles(),
      columnStyles: this.tableStyle.getColumnStyles(),
      didDrawPage: () => {
        this.layout.addHeader(doc, config.pdfTitle || '', pageWidth);
        this.layout.addFooter(doc, pageWidth);
      },
    });

    doc.save(`${config.fileName}.pdf`);
  }
}
