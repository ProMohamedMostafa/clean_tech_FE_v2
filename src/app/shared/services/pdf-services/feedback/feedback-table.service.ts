import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TableStyleService } from '../general layout/table-style.service';
import { FeedbackHistoryItem } from './feedback-report.model';

@Injectable({ providedIn: 'root' })
export class FeedbackTableService {
  constructor(private tableStyle: TableStyleService) {}

  defaultHeaders = ['User', 'Date', 'Rating', 'Comment', 'Status'];
  defaultColumnKeys = ['userName', 'feedbackDate', 'rating', 'comment', 'status'];

  addFeedbackTable(
    doc: jsPDF,
    config: any,
    data: FeedbackHistoryItem[],
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
    });
  }

  private prepareTableBody(data: FeedbackHistoryItem[], columnKeys: string[]): any[][] {
    return data.map((item) => columnKeys.map((key) => (item as any)[key] ?? 'N/A'));
  }
}
