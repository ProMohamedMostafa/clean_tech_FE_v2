// leave-table.service.ts
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
    'Role',
    'Start Date',
    'End Date',
    'Type',
    'Status',
    'Reason',
    'Has File',
  ];

  defaultColumnKeys = [
    'userName',
    'role',
    'startDate',
    'endDate',
    'type',
    'status',
    'reason',
    'hasFile',
  ];

  addLeaveTable(
    doc: jsPDF,
    config: any,
    data: any[],
    startY: number,
    marginX: number,
    pageWidth: number
  ) {
    // Transform hasFile boolean to Yes/No for display
    const displayData = data.map((item) => ({
      ...item,
      hasFile: item.hasFile ? 'Yes' : 'No',
    }));

    autoTable(doc, {
      startY,
      margin: {
        top: this.layout.HEADER_HEIGHT + 10,
        left: marginX,
        right: marginX,
        bottom: 15,
      },
      tableWidth: pageWidth - marginX * 2,
      head: [config.headers],
      body: this.prepareTableBody(displayData, config.columnKeys),
      styles: this.tableStyle.getDefaultStyles(),
      headStyles: this.tableStyle.getHeadStyles(),
      alternateRowStyles: this.tableStyle.getAlternateRowStyles(),
      columnStyles: this.tableStyle.getColumnStyles(),
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
