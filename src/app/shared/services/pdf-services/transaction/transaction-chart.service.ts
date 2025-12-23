import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

@Injectable({ providedIn: 'root' })
export class TransactionChartService {
  addMonthlyGroupedBarChart(
    doc: jsPDF,
    y: number,
    months: string[],
    quantities: number[],
    costs: number[],
    title = 'Monthly Quantity & Cost'
  ) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 3;

    /** Container */
    const containerHeight = 105;
    const containerWidth = pageWidth - marginX * 2;
    const padding = 10;

    /** Draw container border */
    doc.setDrawColor(180);
    doc.setLineWidth(0.5);
    doc.rect(marginX, y, containerWidth, containerHeight);

    /** Title */
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, y + 8, { align: 'center' });

    /** Chart area */
    const chartTopY = y + 16;
    const chartHeight = 60;
    const chartX = marginX + padding;
    const chartWidth = containerWidth - padding * 2;
    const chartBottomY = chartTopY + chartHeight;

    /** Scaling */
    const maxValue = Math.max(...quantities, ...costs, 10);
    const steps = 4;

    /** Y-axis grid + labels */
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');

    for (let i = 0; i <= steps; i++) {
      const value = Math.round((maxValue / steps) * i);
      const posY = chartBottomY - (chartHeight / steps) * i;

      doc.setTextColor(120);
      doc.text(`${value}`, chartX - 4, posY + 2, { align: 'right' });

      doc.setDrawColor(230);
      doc.setLineWidth(0.2);
      doc.line(chartX, posY, chartX + chartWidth, posY);
    }

    /** Bars */
    const groupWidth = chartWidth / months.length;
    const barWidth = groupWidth / 3;
    const innerBarGap = 1; // 🔥 controls gap between quantity & cost bars

    months.forEach((month, i) => {
      const centerX = chartX + i * groupWidth + groupWidth / 2;

      /** Quantity bar */
      const qHeight = (quantities[i] / maxValue) * chartHeight;
      doc.setFillColor(33, 150, 243);
      doc.rect(
        centerX - barWidth - innerBarGap,
        chartBottomY - qHeight,
        barWidth,
        qHeight,
        'F'
      );

      /** Cost bar */
      const cHeight = (costs[i] / maxValue) * chartHeight;
      doc.setFillColor(76, 175, 80);
      doc.rect(
        centerX + innerBarGap,
        chartBottomY - cHeight,
        barWidth,
        cHeight,
        'F'
      );

      /** Month label */
      doc.setFontSize(8);
      doc.setTextColor(0);
      doc.text(month, centerX, chartBottomY + 10, {
        align: 'center',
      });
    });

    /** Legend (separate footer area) */
    const legendY = y + containerHeight - 10;

    doc.setFontSize(8);
    doc.setTextColor(0);

    // Quantity legend
    doc.setFillColor(33, 150, 243);
    doc.rect(pageWidth / 2 - 35, legendY - 4, 4, 4, 'F');
    doc.text('Quantity', pageWidth / 2 - 28, legendY);

    // Cost legend
    doc.setFillColor(76, 175, 80);
    doc.rect(pageWidth / 2 + 10, legendY - 4, 4, 4, 'F');
    doc.text('Cost', pageWidth / 2 + 17, legendY);
  }
}
