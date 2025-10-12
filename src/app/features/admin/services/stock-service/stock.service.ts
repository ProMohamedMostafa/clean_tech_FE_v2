import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { StockRepository } from '../../repositories/stock-repo/stock.repository';

@Injectable({
  providedIn: 'root',
})
export class StockService {
  constructor(private stockRepository: StockRepository) {}

  addStockIn(formData: FormData): Observable<any | null> {
    return this.stockRepository.addStockIn(formData).pipe(
      map((response) => {
        return response;
      })
    );
  }

  addStockOut(payload: {
    materialId: number;
    providerId: number;
    quantity: number;
  }): Observable<any | null> {
    return this.stockRepository.addStockOut(payload).pipe(
      map((response) => {
        return response;
      })
    );
  }

  getStockInTransactions(
    pageNumber: number,
    pageSize?: number,
    search?: string,
    userId?: number,
    startDate?: string,
    endDate?: string,
    providerId?: number,
    categoryId?: number
  ): Observable<any | null> {
    return this.stockRepository
      .getStockInTransactions(
        pageNumber,
        pageSize,
        search,
        userId,
        startDate,
        endDate,
        providerId,
        categoryId
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  getStockOutTransactions(
    pageNumber: number,
    pageSize?: number,
    search?: string,
    userId?: number,
    startDate?: string,
    endDate?: string,
    providerId?: number,
    categoryId?: number
  ): Observable<any | null> {
    return this.stockRepository
      .getStockOutTransactions(
        pageNumber,
        pageSize,
        search,
        userId,
        startDate,
        endDate,
        providerId,
        categoryId
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  getStockTransactions(
    pageNumber: number,
    pageSize?: number,
    search?: string,
    userId?: number,
    startDate?: string,
    endDate?: string,
    providerId?: number,
    categoryId?: number,
    type?: number
  ): Observable<any | null> {
    return this.stockRepository
      .getStockTransactions(
        pageNumber,
        pageSize,
        search,
        userId,
        startDate,
        endDate,
        providerId,
        categoryId,
        type
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
}