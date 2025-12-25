// table-style.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TableStyleService {
  getDefaultStyles(): any {
    return {
      font: 'helvetica',
      fontStyle: 'normal',
      fontSize: 10,
      textColor: '#000000',
      halign: 'start',
      valign: 'middle',
      cellPadding: 2,
      lineColor: '#E0E0E0', // light gray, barely visible
      lineWidth: 0.1, // applies to all borders, we will hide vertical
      overflow: 'linebreak',
    };
  }

  getHeadStyles(): any {
    return {
      fillColor: '#F5F5F5',
      textColor: '#000000',
      fontStyle: 'bold',
      lineColor: '#E0E0E0', // light gray, barely visible
      lineWidth: 0.1,
    };
  }

  getAlternateRowStyles(): any {
    return {
      fillColor: '#ffffff',
    };
  }

  getColumnStyles(): any {
    return {};
  }

  // Hook to hide vertical lines
  hideVerticalLines(doc: any, data: any): void {
    if (data.section === 'body' || data.section === 'head') {
      const { cell } = data;
      doc.setDrawColor('#ffffff'); // white = invisible
      doc.setLineWidth(0);
      // draw vertical line over the cell's right edge to hide it
      doc.line(
        cell.x + cell.width,
        cell.y,
        cell.x + cell.width,
        cell.y + cell.height
      );
    }
  }
}
