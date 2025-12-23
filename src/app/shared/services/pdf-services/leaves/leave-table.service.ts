import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TableStyleService } from '../general layout/table-style.service';
import { LeaveHistoryItem } from './leave-report.model';

@Injectable({ providedIn: 'root' })
export class LeaveTableService {
  constructor(private tableStyle: TableStyleService) {}

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
      startY,
      margin: { left: marginX, right: marginX },
      tableWidth: pageWidth - marginX * 2,
      head: [config.headers],
      body: this.prepareTableBody(data, config.columnKeys),
      styles: this.tableStyle.getDefaultStyles(),
      headStyles: this.tableStyle.getHeadStyles(),
      alternateRowStyles: this.tableStyle.getAlternateRowStyles(),
      columnStyles: this.tableStyle.getColumnStyles(),
      didDrawPage: () => {
        // optional page header/footer
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
