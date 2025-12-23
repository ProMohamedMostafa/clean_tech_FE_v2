import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { FeedbackRatingData } from './feedback-report.model';

@Injectable({ providedIn: 'root' })
export class FeedbackChartService {
  private chartColors = {
    rating: {
      excellent: [76, 175, 80],
      good: [33, 150, 243],
      average: [255, 193, 7],
      poor: [244, 67, 54],
    },
  };

  addRatingChart(doc: jsPDF, x: number, y: number, data: FeedbackRatingData) {
    const chartData = [
      { label: 'Excellent', value: data.excellent, color: this.chartColors.rating.excellent },
      { label: 'Good', value: data.good, color: this.chartColors.rating.good },
      { label: 'Average', value: data.average, color: this.chartColors.rating.average },
      { label: 'Poor', value: data.poor, color: this.chartColors.rating.poor },
    ];
    this.drawChartWithLegend(doc, x, y, 25, chartData, 'Feedback Rating Distribution');
  }

  private drawChartWithLegend(
    doc: jsPDF,
    x: number,
    y: number,
    radius: number,
    data: { label: string; value: number; color: number[] }[],
    title: string
  ) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text(title, x, y);

    const centerX = x + radius + 3;
    const centerY = y + radius + 10;

    this.drawPieChart(doc, centerX, centerY, radius, data);

    const legendX = centerX + radius + 10;
    const legendY = centerY - (data.length * 7) / 2;
    this.drawLegend(doc, legendX, legendY, data);
  }

  private drawPieChart(
    doc: jsPDF,
    centerX: number,
    centerY: number,
    radius: number,
    data: { label: string; value: number; color: number[] }[]
  ) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
      doc.setFillColor(240, 240, 240);
      doc.circle(centerX, centerY, radius, 'F');
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text('No Data', centerX, centerY, { align: 'center' });
      return;
    }

    let startAngle = -90;
    data.forEach((item) => {
      if (item.value === 0) return;
      const sliceAngle = (item.value / total) * 360;
      const steps = Math.max(50, Math.ceil(sliceAngle));
      const angleStep = sliceAngle / steps;

      for (let i = 0; i < steps; i++) {
        const angle1 = (startAngle + angleStep * i) * (Math.PI / 180);
        const angle2 = (startAngle + angleStep * (i + 1)) * (Math.PI / 180);

        const x1 = centerX + radius * Math.cos(angle1);
        const y1 = centerY + radius * Math.sin(angle1);
        const x2 = centerX + radius * Math.cos(angle2);
        const y2 = centerY + radius * Math.sin(angle2);

        doc.setFillColor(item.color[0], item.color[1], item.color[2]);
        doc.triangle(centerX, centerY, x1, y1, x2, y2, 'F');
      }

      startAngle += sliceAngle;
    });

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.circle(centerX, centerY, radius, 'S');
  }

  private drawLegend(
    doc: jsPDF,
    x: number,
    y: number,
    data: { label: string; value: number; color: number[] }[]
  ) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const boxSize = 4;
    const lineHeight = 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    data.forEach((item, index) => {
      const yPos = y + index * lineHeight;
      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.rect(x, yPos - 3, boxSize, boxSize, 'F');

      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.2);
      doc.rect(x, yPos - 3, boxSize, boxSize, 'S');

      doc.setTextColor(60, 60, 60);
      const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
      const text = `${item.label}: ${item.value} (${percentage}%)`;
      doc.text(text, x + boxSize + 2, yPos);
    });
  }
}
