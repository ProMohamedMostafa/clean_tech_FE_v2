import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

@Injectable({ providedIn: 'root' })
export class StockChartService {
  private categoryColors = [
    [33, 150, 243], // blue
    [76, 175, 80], // green
    [244, 67, 54], // red
    [255, 193, 7], // yellow
    [156, 39, 176], // purple
    [0, 188, 212], // cyan
    [255, 87, 34], // orange
  ];

  addCategoryBarChart(
    doc: jsPDF,
    x: number,
    y: number,
    width: number,
    height: number,
    data: any,
    title = 'Stock Value by Month'
  ) {
    const labels = data.labels || [];
    const values = data.values || [];

    // Draw title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(title, x + width / 2, y, { align: 'center' });

    const chartX = x;
    const chartY = y + 10;
    const chartHeight = height - 15; // Adjusted for title
    const chartWidth = width;

    const maxValue = Math.max(...values, 10);
    const barHeight = chartHeight / values.length - 10;

    // Draw horizontal bars
    values.forEach((value: number, index: number) => {
      const barLength = (value / maxValue) * chartWidth;
      const barY = chartY + index * (barHeight + 10);

      // Draw bar
      const color = this.categoryColors[index % this.categoryColors.length];
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(chartX, barY, barLength, barHeight, 'F');

      // Draw Y-axis label (month label)
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(
        labels[index] || `Month ${index + 1}`,
        chartX - 2,
        barY + barHeight / 2 + 2,
        {
          align: 'right',
        }
      );

      // Draw value at end of bar
      doc.text(
        `$${value.toFixed(2)}`,
        chartX + barLength + 2,
        barY + barHeight / 2 + 2,
        {
          align: 'left',
        }
      );
    });

    // Draw X-axis line
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(
      chartX,
      chartY + chartHeight,
      chartX + chartWidth,
      chartY + chartHeight
    );
  }
}
