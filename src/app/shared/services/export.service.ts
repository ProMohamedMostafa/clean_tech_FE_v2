// services/export.service.ts
import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

// START: Type Definitions and Interfaces
type FontType = 'helvetica' | 'times' | 'courier';
type ColorTuple = [number, number, number];
interface LogoConfig {
  readonly url: string;
  readonly width: number;
  readonly height: number;
  readonly x?: number;
  readonly y?: number;
}

export interface ExportConfig {
  fileName: string;
  sheetName?: string;
  headers: string[];
  data: any[];
  columnKeys?: string[];
  columnFormatter?: (data: any) => any[];
  pdfTitle?: string;
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
    period?: string;
    description?: string;
  };
  styling?: {
    primaryColor?: ColorTuple;
    secondaryColor?: ColorTuple;
    headerFontSize?: number;
    bodyFontSize?: number;
    font?: FontType;
  };
  compactMode?: boolean;
  includeCoverPage?: boolean;
  coverPageConfig?: {
    title?: string;
    subtitle?: string;
    preparedFor?: string;
    confidentiality?: string;
    version?: string;
    includeToc?: boolean;
    topRightImage?: string;
    bottomRightImage?: string;
    footerText?: string;
    backgroundColor?: ColorTuple;
  };
}
// END: Type Definitions and Interfaces

// START: Fixed Configuration Constants
const FIXED_LOGO_CONFIG: LogoConfig = {
  url: 'assets/Clean-Tech-new.png',
  width: 60,
  height: 28,
  x: 15,
  y: 10,
} as const;
const FIXED_LOGO_CONFIG_NEW: LogoConfig = {
  url: 'assets/clean-tech-cover.png',
  width: 80,
  height: 38,
  x: 15,
  y: 10,
} as const;

const FIXED_COVER_IMAGES = {
  topRightImage: 'assets/pdf-top-right-cover.png',
  bottomRightImage: 'assets/pdf-bottom-right-cover.png',
} as const;
// END: Fixed Configuration Constants

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  // START: Default Configuration Properties
  private defaultStyling = {
    primaryColor: [41, 128, 185] as ColorTuple,
    secondaryColor: [52, 152, 219] as ColorTuple,
    headerFontSize: 14,
    bodyFontSize: 9,
    font: 'helvetica' as FontType,
  };

  backgroundColor: [number, number, number] = [255, 255, 255];

  private defaultCompanyInfo = {
    name: '',
    address: '',
    phone: '',
    email: '',
  };

  private fixedCoverConfig = {
    backgroundColor: [235, 245, 255] as ColorTuple,
    footerText: '',
  } as const;
  // END: Default Configuration Properties

  // START: Fixed Configuration Getters
  private getFixedLogoConfig(): LogoConfig {
    return FIXED_LOGO_CONFIG;
  }

  private getFixedCoverConfig(config: ExportConfig) {
    const fixedConfig = {
      ...this.fixedCoverConfig,
      topRightImage: FIXED_COVER_IMAGES.topRightImage,
      bottomRightImage: FIXED_COVER_IMAGES.bottomRightImage,
    };

    if (config.coverPageConfig) {
      return {
        ...fixedConfig,
        title: config.coverPageConfig.title,
        subtitle: config.coverPageConfig.subtitle,
        preparedFor: config.coverPageConfig.preparedFor,
        confidentiality: config.coverPageConfig.confidentiality,
        version: config.coverPageConfig.version,
        includeToc: config.coverPageConfig.includeToc,
        footerText: config.coverPageConfig.footerText || fixedConfig.footerText,
      };
    }

    return fixedConfig;
  }
  // END: Fixed Configuration Getters

  // START: Main PDF Export Methods
  async exportToPDF(config: ExportConfig): Promise<void> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const styling = { ...this.defaultStyling, ...config.styling };
    const currentPageWidth = doc.internal.pageSize.getWidth();
    const currentPageHeight = doc.internal.pageSize.getHeight();

    const fixedLogoConfig = this.getFixedLogoConfig();
    const fixedCoverConfig = this.getFixedCoverConfig(config);

    if (config.includeCoverPage !== false) {
      this.addCoverPage(
        doc,
        config,
        styling,
        currentPageWidth,
        currentPageHeight,
        fixedLogoConfig,
        fixedCoverConfig
      );
      doc.addPage();
    }

    // Calculate header Y position
    const headerY = this.addCompactHeaderSection(
      doc,
      config,
      styling,
      currentPageWidth,
      fixedLogoConfig
    );

    // Calculate start position for content
    const startY = headerY + 2;

    autoTable(doc, {
      startY: startY + 5,
      head: [config.headers],
      body: this.prepareTableData(config),
      styles: {
        fontSize: styling.bodyFontSize,
        cellPadding: 3,
        font: styling.font,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: styling.primaryColor,
        textColor: 255,
        fontStyle: 'bold',
        fontSize: styling.bodyFontSize + 1,
        cellPadding: 4,
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248],
      },
      tableLineColor: styling.primaryColor,
      tableLineWidth: 0.5,
      margin: { top: startY + 5 },
      didDrawPage: (data) => {
        const pageNumber = data.pageNumber;
        const hasCoverPage = config.includeCoverPage !== false;

        // Determine if this is a content page (not cover page)
        if (hasCoverPage && pageNumber === 1) {
          // This is the cover page, don't add header or footer
          return;
        }

        // For all content pages (including first content page and subsequent pages)
        // Add header to all content pages
        this.addCompactHeaderSection(
          doc,
          config,
          styling,
          currentPageWidth,
          fixedLogoConfig
        );

        // Add footer to all content pages
        this.addCompactFooterSection(doc, config, styling, currentPageWidth);
      },
    });

    doc.save(`${config.fileName}.pdf`);
  }

  async printPDF(config: ExportConfig): Promise<void> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const styling = { ...this.defaultStyling, ...config.styling };
    const currentPageWidth = doc.internal.pageSize.getWidth();
    const currentPageHeight = doc.internal.pageSize.getHeight();

    const fixedLogoConfig = this.getFixedLogoConfig();
    const fixedCoverConfig = this.getFixedCoverConfig(config);

    if (config.includeCoverPage !== false) {
      this.addCoverPage(
        doc,
        config,
        styling,
        currentPageWidth,
        currentPageHeight,
        fixedLogoConfig,
        fixedCoverConfig
      );
      doc.addPage();
    }

    // Calculate header Y position
    const headerY = this.addCompactHeaderSection(
      doc,
      config,
      styling,
      currentPageWidth,
      fixedLogoConfig
    );

    // Calculate start position for content
    const startY = headerY + 2;

    autoTable(doc, {
      startY: startY + 5,
      head: [config.headers],
      body: this.prepareTableData(config),
      styles: {
        fontSize: styling.bodyFontSize,
        cellPadding: 3,
        font: styling.font,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: styling.primaryColor,
        textColor: 255,
        fontStyle: 'bold',
        fontSize: styling.bodyFontSize + 1,
        cellPadding: 4,
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248],
      },
      tableLineColor: styling.primaryColor,
      tableLineWidth: 0.5,
      margin: { top: startY + 5 },
      didDrawPage: (data) => {
        const pageNumber = data.pageNumber;
        const hasCoverPage = config.includeCoverPage !== false;

        // Determine if this is a content page (not cover page)
        if (hasCoverPage && pageNumber === 1) {
          // This is the cover page, don't add header or footer
          return;
        }

        // For all content pages (including first content page and subsequent pages)
        // Add header to all content pages
        this.addCompactHeaderSection(
          doc,
          config,
          styling,
          currentPageWidth,
          fixedLogoConfig
        );

        // Add footer to all content pages
        this.addCompactFooterSection(doc, config, styling, currentPageWidth);
      },
    });

    const pdfWindow = window.open(doc.output('bloburl'), '_blank');
    pdfWindow?.focus();
    pdfWindow?.print();
  }
  // END: Main PDF Export Methods

  // START: PDF Layout Methods
  private addCoverPage(
    doc: jsPDF,
    config: ExportConfig,
    styling: typeof this.defaultStyling,
    pageWidth: number,
    pageHeight: number,
    fixedLogoConfig: LogoConfig,
    fixedCoverConfig: any
  ): void {
    doc.setFillColor(...this.backgroundColor);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    const centerX = pageWidth / 2;
    let currentY = 0;

    if (fixedLogoConfig.url) {
      try {
        doc.addImage(FIXED_LOGO_CONFIG_NEW.url, 'PNG', 0, 0, 100, 50);
      } catch (error) {
        console.warn('Could not load fixed logo image for cover page:', error);
      }
    }

    if (fixedCoverConfig.topRightImage) {
      try {
        const topRightImageWidth = 60;
        const topRightImageHeight = 80;
        const topRightImageX = pageWidth - topRightImageWidth;
        const topRightImageY = 0;

        doc.addImage(
          fixedCoverConfig.topRightImage,
          'PNG',
          topRightImageX,
          topRightImageY,
          topRightImageWidth,
          topRightImageHeight
        );
      } catch (error) {
        console.warn(
          'Could not load fixed top-right image for cover page:',
          error
        );
      }
    }

    currentY = pageHeight / 2 - 30;

    const title =
      fixedCoverConfig.title ||
      config.pdfTitle ||
      'Smart operating solutions for more productive facilities';

    doc.setFont(styling.font, 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...styling.primaryColor);

    const splitTitle = doc.splitTextToSize(title, pageWidth);
    const titleHeight = splitTitle.length * 7;
    doc.text(splitTitle, centerX, currentY, { align: 'center' });

    currentY += titleHeight + 15;

    const description =
      fixedCoverConfig.subtitle ||
      config.reportInfo?.description ||
      'This report is generated by a CleanTech company.';
    doc.setFont(styling.font, 'normal');
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);

    const splitDesc = doc.splitTextToSize(description, pageWidth);
    const descHeight = splitDesc.length * 6;
    doc.text(splitDesc, centerX, currentY, { align: 'center' });

    if (fixedCoverConfig.bottomRightImage) {
      try {
        const cleanerImageWidth = 100;
        const cleanerImageHeight = 120;
        const cleanerImageX = pageWidth - cleanerImageWidth;
        const cleanerImageY = pageHeight - cleanerImageHeight;

        doc.addImage(
          fixedCoverConfig.bottomRightImage,
          'PNG',
          cleanerImageX,
          cleanerImageY,
          cleanerImageWidth,
          cleanerImageHeight
        );
      } catch (error) {
        console.warn(
          'Could not load fixed cleaner image for cover page:',
          error
        );
      }
    }

    const footerY = pageHeight - 5;
    doc.setFont(styling.font, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);

    doc.text(fixedCoverConfig.footerText, centerX, footerY, {
      align: 'center',
    });
  }

  private addCompactHeaderSection(
    doc: jsPDF,
    config: ExportConfig,
    styling: typeof this.defaultStyling,
    pageWidth: number,
    fixedLogoConfig: LogoConfig
  ): number {
    const headerY = 10;
    const paddingX = 0;
    const headerHeight = 17;

    /* ---------------- Logo (Left) ---------------- */
    if (fixedLogoConfig.url) {
      try {
        const logoHeight = 12; // compact height
        const logoWidth =
          (fixedLogoConfig.width / fixedLogoConfig.height) * logoHeight;

        doc.addImage(fixedLogoConfig.url, 'PNG', 5, headerY, 40, logoHeight);
      } catch (error) {
        console.warn('Could not load fixed logo image:', error);
      }
    }

    /* ---------------- Title (Right) ---------------- */
    if (config.pdfTitle) {
      doc.setFont(styling.font, 'bold');
      doc.setFontSize(styling.headerFontSize - 2);
      doc.setTextColor(40, 40, 40);

      doc.text(config.pdfTitle, pageWidth - 5, headerY + 8, {
        align: 'right',
      });
    }

    /* ---------------- Divider ---------------- */
    const dividerY = headerY + headerHeight - 2;
    doc.setDrawColor(39, 174, 96);
    doc.setLineWidth(0.4);
    doc.line(paddingX, dividerY, pageWidth - paddingX, dividerY);

    return dividerY + 4;
  }

  private addCompactFooterSection(
    doc: jsPDF,
    config: ExportConfig,
    styling: typeof this.defaultStyling,
    pageWidth: number
  ): void {
    const pageHeight = doc.internal.pageSize.getHeight();
    const footerY = pageHeight - 8;

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    doc.line(15, footerY - 3, pageWidth - 15, footerY - 3);

    doc.setFont(styling.font, 'normal');
    doc.setFontSize(styling.bodyFontSize - 2);
    doc.setTextColor(120, 120, 120);

    const companyInfo = { ...this.defaultCompanyInfo, ...config.companyInfo };

    if (companyInfo.name) {
      doc.text(companyInfo.name, 15, footerY);
    }

    const timestamp = new Date().toLocaleDateString();
    doc.text(`Generated: ${timestamp}`, pageWidth / 2, footerY, {
      align: 'center',
    });

    const pageCount = (doc as any).internal.getNumberOfPages();
    const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
    doc.text(`Page ${currentPage}/${pageCount}`, pageWidth - 15, footerY, {
      align: 'right',
    });
  }
  // END: PDF Layout Methods

  // START: Data Preparation Methods
  private prepareTableData(config: ExportConfig): any[][] {
    if (!config.data || config.data.length === 0) {
      return [['No data available']];
    }

    if (config.columnFormatter) {
      return config.data.map((item) => config.columnFormatter!(item));
    }

    if (config.columnKeys && config.columnKeys.length > 0) {
      return config.data.map((item) =>
        config.columnKeys!.map((key) => this.getNestedValue(item, key))
      );
    }

    return config.data.map((item) => {
      if (Array.isArray(item)) {
        return item;
      }
      return Object.values(item);
    });
  }

  private getNestedValue(obj: any, path: string): any {
    if (!obj || !path) return '';

    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : '';
    }, obj);
  }
  // END: Data Preparation Methods

  // START: Excel Export Methods
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

  private prepareExcelData(config: ExportConfig): any[] {
    if (!config.data || config.data.length === 0) {
      return [{ 'No Data': 'No data available' }];
    }

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

    return config.data;
  }
  // END: Excel Export Methods

  // START: Configuration Methods
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

  setDefaultLogo(
    logoUrl?: string,
    width: number = 50,
    height: number = 23
  ): void {
    console.warn(
      'setDefaultLogo() is deprecated. Logo configuration is now fixed and cannot be changed.'
    );
  }

  setDefaultStyling(
    styling: Partial<{
      primaryColor: ColorTuple;
      secondaryColor: ColorTuple;
      headerFontSize: number;
      bodyFontSize: number;
      font: FontType;
    }>
  ): void {
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
  // END: Configuration Methods

  // START: Convenience Methods
  quickPDF(fileName: string, headers: string[], data: any[]): void {
    this.exportToPDF({ fileName, headers, data });
  }

  quickExcel(fileName: string, headers: string[], data: any[]): void {
    this.exportToExcel({ fileName, headers, data });
  }

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

  exportProfessionalReport(
    fileName: string,
    headers: string[],
    data: any[],
    title: string,
    companyName?: string
  ): void {
    const config: ExportConfig = {
      fileName,
      headers,
      data,
      pdfTitle: title,
      includeCoverPage: true,
      companyInfo: companyName ? { name: companyName } : undefined,
      reportInfo: {
        reportDate: new Date(),
        preparedBy: 'System',
      },
    };

    this.exportToPDF(config);
  }

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
      includeCoverPage: false,
      styling: {
        headerFontSize: 12,
        bodyFontSize: 8,
      },
    };

    this.exportToPDF(config);
  }

  exportWithCoverPage(
    fileName: string,
    headers: string[],
    data: any[],
    title: string,
    coverPageConfig: {
      title?: string;
      subtitle?: string;
      preparedFor?: string;
      confidentiality?: string;
      version?: string;
      footerText?: string;
    },
    companyInfo?: {
      name?: string;
      address?: string;
      phone?: string;
      email?: string;
    }
  ): void {
    const config: ExportConfig = {
      fileName,
      headers,
      data,
      pdfTitle: title,
      includeCoverPage: true,
      coverPageConfig: {
        title: coverPageConfig.title || title,
        subtitle: coverPageConfig.subtitle,
        confidentiality: coverPageConfig.confidentiality,
        version: coverPageConfig.version,
        footerText: coverPageConfig.footerText,
      },
      companyInfo,
      reportInfo: {
        reportDate: new Date(),
        preparedBy: 'System',
      },
    };

    this.exportToPDF(config);
  }

  exportWithSvgStyleCover(
    fileName: string,
    headers: string[],
    data: any[],
    companyInfo?: {
      name?: string;
      address?: string;
      phone?: string;
      email?: string;
    }
  ): void {
    const config: ExportConfig = {
      fileName,
      headers,
      data,
      pdfTitle: 'Smart operating solutions for more productive facilities',
      includeCoverPage: true,
      companyInfo,
      reportInfo: {
        reportDate: new Date(),
        description:
          'We offer an integrated facility management system that goes beyond mere cleaning, to include meticulously organizing every detail of daily work.',
        preparedBy: 'System',
      },
    };

    this.exportToPDF(config);
  }
  // END: Convenience Methods
}
