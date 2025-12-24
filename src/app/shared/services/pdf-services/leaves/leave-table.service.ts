import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TableStyleService } from '../general layout/table-style.service';
import { LeaveHistoryItem } from './leave-report.model';
import { PdfLayoutService } from '../general layout/pdf-layout.service';

@Injectable({ providedIn: 'root' })
export class LeaveTableService {
  constructor(
    private tableStyle: TableStyleService,
    private layout: PdfLayoutService
  ) {}

  defaultHeaders = [
    'User',
    'Leave Type',
    'Start Date',
    'End Date',
    'Duration',
    'Status',
    'Reason',
  ];

  defaultColumnKeys = [
    'userName',
    'leaveType',
    'startDate',
    'endDate',
    'duration',
    'status',
    'reason',
  ];

  addLeaveTable(
    doc: jsPDF,
    config: any,
    data: LeaveHistoryItem[],
    startY: number,
    marginX: number,
    pageWidth: number
  ) {
    autoTable(doc, {
      // ✅ page 1 start
      startY,

      // ✅ reserve space for header on ALL pages
      margin: {
        top: this.layout.HEADER_HEIGHT + 10,
        left: marginX,
        right: marginX,
        bottom: 15,
      },

      tableWidth: pageWidth - marginX * 2,

      head: [config.headers],
      body: this.prepareTableBody(data, config.columnKeys),

      styles: this.tableStyle.getDefaultStyles(),
      headStyles: this.tableStyle.getHeadStyles(),
      alternateRowStyles: this.tableStyle.getAlternateRowStyles(),
      columnStyles: this.tableStyle.getColumnStyles(),

      // ✅ redraw header after page breaks
      didDrawPage: () => {
        this.layout.addHeader(doc, config.pdfTitle, pageWidth);
      },
    });
  }

  private prepareTableBody(
    data: LeaveHistoryItem[],
    columnKeys: string[]
  ): any[][] {
    return data.map((item) =>
      columnKeys.map((key) => (item as any)[key] ?? 'N/A')
    );
  }
}
