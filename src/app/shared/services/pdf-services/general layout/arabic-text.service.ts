// arabic-text.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ArabicTextService {
  // Check if text contains Arabic characters
  isArabic(text: string): boolean {
    if (!text) return false;

    // Arabic Unicode ranges
    const arabicRanges = [
      /[\u0600-\u06FF]/, // Basic Arabic
      /[\u0750-\u077F]/, // Arabic Supplement
      /[\u08A0-\u08FF]/, // Arabic Extended-A
      /[\uFB50-\uFDFF]/, // Arabic Presentation Forms-A
      /[\uFE70-\uFEFF]/, // Arabic Presentation Forms-B
    ];

    return arabicRanges.some((pattern) => pattern.test(text));
  }

  // Decode Arabic text (handles URL encoding issues)
  decodeArabicText(text: string): string {
    if (!text) return '';

    try {
      // Decode URL encoded characters
      let decoded = decodeURIComponent(escape(text));

      // Handle common encoding issues
      decoded = decoded.replace(/Ã|Å|Ä|Â/g, 'ا'); // Various forms of Alif
      decoded = decoded.replace(/Ø|Ù|Ú|Û/g, 'ع'); // Various forms of 'Ayn
      decoded = decoded.replace(/Ù|Û|Ù/g, 'و'); // Various forms of Waw

      return decoded;
    } catch (e) {
      // If decoding fails, return original text
      console.warn('Arabic text decoding failed:', e);
      return text;
    }
  }

  // Format Arabic text for PDF (reverse for RTL)
  formatForPDF(text: string): string {
    if (!text || !this.isArabic(text)) return text;

    const decoded = this.decodeArabicText(text);

    // For Arabic text in PDF, we need to:
    // 1. Reverse the string (jsPDF renders LTR by default)
    // 2. Handle connected letters if needed

    const lines = decoded.split('\n');
    const formattedLines = lines.map((line) => {
      const words = line.split(/\s+/);
      const reversedWords = words.map((word) => {
        if (this.isArabic(word)) {
          return this.reverseArabicWord(word);
        }
        return word;
      });
      return reversedWords.reverse().join(' ');
    });

    return formattedLines.join('\n');
  }

  // Reverse Arabic word while preserving numbers and symbols
  private reverseArabicWord(word: string): string {
    // Don't reverse if it's not Arabic
    if (!this.isArabic(word)) return word;

    // Keep numbers and special characters in place
    const chars = word.split('');
    const arabicChars: any = [];
    const otherChars: any = [];

    chars.forEach((char, index) => {
      if (this.isArabic(char) || this.isArabicPunctuation(char)) {
        arabicChars.push({ char, index });
      } else {
        otherChars.push({ char, index });
      }
    });

    // Reverse only Arabic characters
    arabicChars.reverse();

    // Reconstruct the word
    const result = new Array(chars.length);
    arabicChars.forEach((item: any) => {
      result[item.index] = item.char;
    });
    otherChars.forEach((item: any) => {
      result[item.index] = item.char;
    });

    return result.join('');
  }

  private isArabicPunctuation(char: string): boolean {
    const arabicPunctuation = [
      '،',
      '؛',
      '؟',
      'ـ',
      '«',
      '»',
      '٪',
      '٫',
      '٬',
      '۔',
    ];
    return arabicPunctuation.includes(char);
  }

  // Check API response and fix encoding issues
  fixApiResponseEncoding(data: any): any {
    if (!data) return data;

    if (typeof data === 'string') {
      return this.decodeArabicText(data);
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.fixApiResponseEncoding(item));
    }

    if (typeof data === 'object') {
      const result: any = {};
      for (const key in data) {
        result[key] = this.fixApiResponseEncoding(data[key]);
      }
      return result;
    }

    return data;
  }
}
