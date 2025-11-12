// services/export.service.ts
import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

// Define specific types for better TypeScript support
type FontType = 'helvetica' | 'times' | 'courier';
type ColorTuple = [number, number, number];

export interface ExportConfig {
  fileName: string;
  sheetName?: string;
  headers: string[];
  data: any[];
  columnKeys?: string[]; // Map object properties to columns
  columnFormatter?: (data: any) => any[]; // Custom formatter function
  pdfTitle?: string;
  pdfOrientation?: 'portrait' | 'landscape';
  logo?: {
    url: string;
    width?: number;
    height?: number;
    x?: number;
    y?: number;
  };
  companyInfo?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  reportInfo?: {
    reportDate?: Date;
    reportId?: string;
    preparedBy?: string;
  };
  styling?: {
    primaryColor?: ColorTuple;
    secondaryColor?: ColorTuple;
    headerFontSize?: number;
    bodyFontSize?: number;
    font?: FontType;
  };
  compactMode?: boolean; // New option for compact header
}

// Default logo configuration
const DEFAULT_LOGO_CONFIG = {
  url: 'assets/Clean-Tech.png',
  width: 60, // Reduced from 75
  height: 28, // Reduced from 35
  x: 15,
  y: 10, // Reduced from 15
};

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  private defaultStyling: {
    primaryColor: ColorTuple;
    secondaryColor: ColorTuple;
    headerFontSize: number;
    bodyFontSize: number;
    font: FontType;
  } = {
    primaryColor: [41, 128, 185],
    secondaryColor: [52, 152, 219],
    headerFontSize: 14, // Reduced from 16
    bodyFontSize: 9, // Reduced from 10
    font: 'helvetica',
  };

  private defaultCompanyInfo = {
    name: '',
    address: '',
    phone: '',
    email: '',
  };

  // ==================== PDF EXPORT ====================

  /**
   * Export data as PDF with professional styling
   */
  exportToPDF(config: ExportConfig): void {
    const doc = new jsPDF({
      orientation: config.pdfOrientation || 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const styling = { ...this.defaultStyling, ...config.styling };
    const currentPageWidth = doc.internal.pageSize.getWidth();

    // Use compact header that returns the startY position
    const startY = this.addCompactHeaderSection(
      doc,
      config,
      styling,
      currentPageWidth
    );

    autoTable(doc, {
      startY: startY + 3, // Reduced spacing
      head: [config.headers],
      body: this.prepareTableData(config),
      styles: {
        fontSize: styling.bodyFontSize,
        cellPadding: 3, // Reduced from 4
        font: styling.font,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: styling.primaryColor,
        textColor: 255,
        fontStyle: 'bold',
        fontSize: styling.bodyFontSize + 1,
        cellPadding: 4, // Reduced from 5
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248],
      },
      tableLineColor: styling.primaryColor,
      tableLineWidth: 0.5,
      margin: { top: startY + 3 }, // Reduced spacing
      didDrawPage: (data) => {
        this.addCompactFooterSection(doc, config, styling, currentPageWidth);
      },
    });

    doc.save(`${config.fileName}.pdf`);
  }

  /**
   * Print data as PDF in new window with enhanced styling
   */
  printPDF(config: ExportConfig): void {
    const doc = new jsPDF({
      orientation: config.pdfOrientation || 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const styling = { ...this.defaultStyling, ...config.styling };
    const currentPageWidth = doc.internal.pageSize.getWidth();

    // Use compact header
    const startY = this.addCompactHeaderSection(
      doc,
      config,
      styling,
      currentPageWidth
    );

    autoTable(doc, {
      startY: startY + 3, // Reduced spacing
      head: [config.headers],
      body: this.prepareTableData(config),
      styles: {
        fontSize: styling.bodyFontSize,
        cellPadding: 3, // Reduced from 4
        font: styling.font,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: styling.primaryColor,
        textColor: 255,
        fontStyle: 'bold',
        fontSize: styling.bodyFontSize + 1,
        cellPadding: 4, // Reduced from 5
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248],
      },
      tableLineColor: styling.primaryColor,
      tableLineWidth: 0.5,
      margin: { top: startY + 3 }, // Reduced spacing
      didDrawPage: (data) => {
        this.addCompactFooterSection(doc, config, styling, currentPageWidth);
      },
    });

    const pdfWindow = window.open(doc.output('bloburl'), '_blank');
    pdfWindow?.focus();
    pdfWindow?.print();
  }

  // ==================== COMPACT HEADER & FOOTER SECTIONS ====================

  /**
   * Add compact header with logo and company info - returns startY position for table
   */
  private addCompactHeaderSection(
    doc: jsPDF,
    config: ExportConfig,
    styling: {
      primaryColor: ColorTuple;
      secondaryColor: ColorTuple;
      headerFontSize: number;
      bodyFontSize: number;
      font: FontType;
    },
    pageWidth: number
  ): number {
    const headerY = 8; // Reduced from 15
    let maxContentHeight = 0;

    // Add logo to top left (smaller size)
    const logoConfig = config.logo || DEFAULT_LOGO_CONFIG;

    if (logoConfig?.url) {
      try {
        const logoWidth = logoConfig.width || 50; // Smaller default
        const logoHeight = logoConfig.height || 23; // Smaller default
        const logoX = logoConfig.x || 15;
        const logoY = headerY;

        doc.addImage(
          logoConfig.url,
          'PNG',
          logoX,
          logoY,
          logoWidth,
          logoHeight
        );
        maxContentHeight = Math.max(maxContentHeight, logoHeight);
      } catch (error) {
        console.warn('Could not load logo image:', error);
      }
    }

    // Compact company info section - top right
    const companyInfo = { ...this.defaultCompanyInfo, ...config.companyInfo };
    const companyX = pageWidth - 15; // Right aligned
    let companyY = headerY;

    if (companyInfo.name) {
      doc.setFont(styling.font, 'bold');
      doc.setFontSize(styling.headerFontSize - 2); // Smaller font
      doc.setTextColor(
        styling.primaryColor[0],
        styling.primaryColor[1],
        styling.primaryColor[2]
      );
      doc.text(companyInfo.name, companyX, companyY, { align: 'right' });
      companyY += 3; // Reduced spacing
    }

    // Smaller font for details
    doc.setFont(styling.font, 'normal');
    doc.setFontSize(styling.bodyFontSize - 1);
    doc.setTextColor(100, 100, 100);

    // Combine contact info to save space
    const contactDetails = [];
    if (companyInfo.phone) contactDetails.push(`Tel: ${companyInfo.phone}`);
    if (companyInfo.email) contactDetails.push(companyInfo.email);

    if (contactDetails.length > 0) {
      doc.text(contactDetails.join(' | '), companyX, companyY, {
        align: 'right',
      });
      companyY += 3;
    }

    if (companyInfo.address) {
      doc.text(companyInfo.address, companyX, companyY, { align: 'right' });
      companyY += 3;
    }

    maxContentHeight = Math.max(maxContentHeight, companyY - headerY);

    // Report title (centered, below header)
    let currentY = headerY + maxContentHeight + 5; // Reduced spacing

    if (config.pdfTitle) {
      doc.setFont(styling.font, 'bold');
      doc.setFontSize(styling.headerFontSize);
      doc.setTextColor(40, 40, 40);
      doc.text(config.pdfTitle, pageWidth / 2, currentY, { align: 'center' });
      currentY += 5; // Reduced spacing
    }

    // Report metadata (compact, single line if possible)
    const reportInfo = {
      reportDate: new Date(),
      reportId: `RPT-${Date.now()}`,
      preparedBy: 'System',
      ...config.reportInfo,
    };

    const metaData = [];
    if (reportInfo.reportDate) {
      metaData.push(`Date: ${reportInfo.reportDate.toLocaleDateString()}`);
    }
    if (reportInfo.reportId && config.reportInfo?.reportId) {
      metaData.push(`ID: ${reportInfo.reportId}`);
    }
    if (reportInfo.preparedBy) {
      metaData.push(`By: ${reportInfo.preparedBy}`);
    }

    if (metaData.length > 0) {
      doc.setFont(styling.font, 'normal');
      doc.setFontSize(styling.bodyFontSize - 1);
      doc.setTextColor(100, 100, 100);
      doc.text(metaData.join(' | '), pageWidth / 2, currentY, {
        align: 'center',
      });
      currentY += 4; // Reduced spacing
    }

    // Add compact header separator line
    doc.setDrawColor(
      styling.primaryColor[0],
      styling.primaryColor[1],
      styling.primaryColor[2]
    );
    doc.setLineWidth(0.3); // Thinner line
    doc.line(15, currentY, pageWidth - 15, currentY);

    return currentY + 2; // Return position for table start
  }

  /**
   * Add compact footer with minimal height
   */
  private addCompactFooterSection(
    doc: jsPDF,
    config: ExportConfig,
    styling: {
      primaryColor: ColorTuple;
      secondaryColor: ColorTuple;
      headerFontSize: number;
      bodyFontSize: number;
      font: FontType;
    },
    pageWidth: number
  ): void {
    const pageHeight = doc.internal.pageSize.getHeight();
    const footerY = pageHeight - 8; // Raised footer

    // Thin footer separator line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1); // Thinner line
    doc.line(15, footerY - 3, pageWidth - 15, footerY - 3);

    // Compact footer content
    doc.setFont(styling.font, 'normal');
    doc.setFontSize(styling.bodyFontSize - 2); // Smaller font
    doc.setTextColor(120, 120, 120); // Lighter color

    const companyInfo = { ...this.defaultCompanyInfo, ...config.companyInfo };

    // Left: Company name
    if (companyInfo.name) {
      doc.text(companyInfo.name, 15, footerY);
    }

    // Center: Timestamp (shorter format)
    const timestamp = new Date().toLocaleDateString();
    doc.text(`Generated: ${timestamp}`, pageWidth / 2, footerY, {
      align: 'center',
    });

    // Right: Page number
    const pageCount = (doc as any).internal.getNumberOfPages();
    const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
    doc.text(`Page ${currentPage}/${pageCount}`, pageWidth - 15, footerY, {
      align: 'right',
    });
  }

  // ==================== EXCEL EXPORT ====================

  /**
   * Export data as Excel file
   */
  exportToExcel(config: ExportConfig): void {
    const excelData = this.prepareExcelData(config);
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      config.sheetName || 'Sheet1'
    );

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    FileSaver.saveAs(
      new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      `${config.fileName}.xlsx`
    );
  }

  // ==================== DATA PREPARATION ====================

  /**
   * Prepare table data for PDF based on configuration
   */
  private prepareTableData(config: ExportConfig): any[][] {
    if (!config.data || config.data.length === 0) {
      return [['No data available']];
    }

    // Use custom formatter if provided
    if (config.columnFormatter) {
      return config.data.map((item) => config.columnFormatter!(item));
    }

    // Use column keys mapping if provided
    if (config.columnKeys && config.columnKeys.length > 0) {
      return config.data.map((item) =>
        config.columnKeys!.map((key) => this.getNestedValue(item, key))
      );
    }

    // Default: use array values or object values
    return config.data.map((item) => {
      if (Array.isArray(item)) {
        return item;
      }
      return Object.values(item);
    });
  }

  /**
   * Prepare data for Excel export
   */
  private prepareExcelData(config: ExportConfig): any[] {
    if (!config.data || config.data.length === 0) {
      return [{ 'No Data': 'No data available' }];
    }

    // Use column keys mapping if provided
    if (config.columnKeys && config.columnKeys.length > 0) {
      return config.data.map((item) => {
        const row: any = {};
        config.headers.forEach((header, index) => {
          const key = config.columnKeys![index];
          row[header] = this.getNestedValue(item, key);
        });
        return row;
      });
    }

    // Default: use the data as is (assuming it's already in key-value format)
    return config.data;
  }

  /**
   * Get nested object value using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    if (!obj || !path) return '';

    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : '';
    }, obj);
  }

  // ==================== CONFIGURATION METHODS ====================

  /**
   * Set default company information
   */
  setDefaultCompanyInfo(
    companyInfo: Partial<{
      name: string;
      address: string;
      phone: string;
      email: string;
    }>
  ): void {
    this.defaultCompanyInfo = { ...this.defaultCompanyInfo, ...companyInfo };
  }

  /**
   * Set default logo configuration
   */
  setDefaultLogo(
    logoUrl: string,
    width: number = 50, // Smaller default
    height: number = 23 // Smaller default
  ): void {
    DEFAULT_LOGO_CONFIG.url = logoUrl;
    DEFAULT_LOGO_CONFIG.width = width;
    DEFAULT_LOGO_CONFIG.height = height;
  }

  /**
   * Set default styling
   */
  setDefaultStyling(
    styling: Partial<{
      primaryColor: ColorTuple;
      secondaryColor: ColorTuple;
      headerFontSize: number;
      bodyFontSize: number;
      font: FontType;
    }>
  ): void {
    // Type-safe assignment
    this.defaultStyling = {
      primaryColor: styling.primaryColor || this.defaultStyling.primaryColor,
      secondaryColor:
        styling.secondaryColor || this.defaultStyling.secondaryColor,
      headerFontSize:
        styling.headerFontSize ?? this.defaultStyling.headerFontSize,
      bodyFontSize: styling.bodyFontSize ?? this.defaultStyling.bodyFontSize,
      font: styling.font || this.defaultStyling.font,
    };
  }

  // ==================== QUICK EXPORT METHODS ====================

  /**
   * Quick PDF export with minimal configuration
   */
  quickPDF(fileName: string, headers: string[], data: any[]): void {
    this.exportToPDF({ fileName, headers, data });
  }

  /**
   * Quick Excel export with minimal configuration
   */
  quickExcel(fileName: string, headers: string[], data: any[]): void {
    this.exportToExcel({ fileName, headers, data });
  }

  /**
   * Export with object mapping
   */
  exportMappedData(
    fileName: string,
    headers: string[],
    data: any[],
    columnKeys: string[]
  ): void {
    this.exportToPDF({
      fileName,
      headers,
      data,
      columnKeys,
    });
  }

  /**
   * Enhanced export with professional styling
   */
  exportProfessionalReport(
    fileName: string,
    headers: string[],
    data: any[],
    title: string,
    logoUrl?: string,
    companyName?: string
  ): void {
    const config: ExportConfig = {
      fileName,
      headers,
      data,
      pdfTitle: title,
      logo: logoUrl ? { url: logoUrl } : undefined,
      companyInfo: companyName ? { name: companyName } : undefined,
      reportInfo: {
        reportDate: new Date(),
        preparedBy: 'System',
      },
    };

    this.exportToPDF(config);
  }

  /**
   * Ultra-compact export for data-heavy reports
   */
  exportCompactReport(
    fileName: string,
    headers: string[],
    data: any[],
    title?: string
  ): void {
    const config: ExportConfig = {
      fileName,
      headers,
      data,
      pdfTitle: title,
      compactMode: true,
      styling: {
        headerFontSize: 12,
        bodyFontSize: 8,
      },
    };

    this.exportToPDF(config);
  }
}
