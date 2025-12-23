import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { PdfCoverService } from '../general layout/pdf-cover.service';
import { PdfLayoutService } from '../general layout/pdf-layout.service';
import { FeedbackChartService } from './feedback-chart.service';
import { FeedbackTableService } from './feedback-table.service';
import { FeedbackReportConfig } from '../models/feedback-report.model';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { FeedbackHistoryItem, FeedbackRatingData } from './feedback-report.model';

@Injectable({ providedIn: 'root' })
export class FeedbackReportService {
  private ratingData: FeedbackRatingData = { excellent: 40, good: 30, average: 20, poor: 10 };

  constructor(
    private cover: PdfCoverService,
    private layout: PdfLayoutService,
    private chart: FeedbackChartService,
    private table: FeedbackTableService
  ) {}

  generateFeedbackPDF(config: FeedbackReportConfig): Observable<void> {
    const fullConfig = this.buildConfig(config);

    return this.fetchFeedbackData(fullConfig).pipe(
      map((data) => this.createPDF(fullConfig, data)),
      catchError((err) => {
        console.error('Error generating Feedback PDF', err);
        throw err;
      })
    );
  }

  private buildConfig(config: FeedbackReportConfig) {
    return {
      fileName: config.fileName || 'feedback_report',
      pdfTitle: config.pdfTitle || 'Feedback Report',
      includeCoverPage: config.includeCoverPage ?? true,
      reportInfo: config.reportInfo || { reportDate: new Date(), preparedBy: 'System' },
      headers: config.headers || this.table.defaultHeaders,
      columnKeys: config.columnKeys || this.table.defaultColumnKeys,
      data: config.data || [],
    };
  }

  private fetchFeedbackData(config: any): Observable<FeedbackHistoryItem[]> {
    return of(this.getMockData());
  }

  private getMockData(): FeedbackHistoryItem[] {
    return [
      { userName: 'Alice', feedbackDate: '2025-12-01', rating: 'Excellent', comment: 'Great!', status: 'Reviewed' },
      { userName: 'Bob', feedbackDate: '2025-12-02', rating: 'Good', comment: 'Satisfactory', status: 'Pending' },
      { userName: 'Charlie', feedbackDate: '2025-12-03', rating: 'Poor', comment: 'Needs improvement', status: 'Reviewed' },
    ];
  }

  private createPDF(config: any, data: FeedbackHistoryItem[]): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 5;

    if (config.includeCoverPage) {
      this.cover.addCover(doc, config, pageWidth, doc.internal.pageSize.getHeight());
      doc.addPage();
    }

    const startY = this.layout.addHeader(doc, config.pdfTitle, pageWidth);
    this.layout.addMetadata(doc, config, pageWidth, startY);

    this.chart.addRatingChart(doc, 10, 40, this.ratingData);

    this.table.addFeedbackTable(doc, config, data, startY + 120, marginX, pageWidth);

    doc.save(`${config.fileName}.pdf`);
  }

  updateChartData(ratingData?: FeedbackRatingData) {
    if (ratingData) this.ratingData = ratingData;
  }
}
