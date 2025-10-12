import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { CategoryRepository } from '../../repositories/stock-repo/category.repository';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  constructor(private categoryRepository: CategoryRepository) {}

  /**
   * Fetches categories with pagination and filtering
   */
  getCategories(
    pageNumber: number,
    pageSize?: number,
    search?: string,
    parentCategory?: number,
    unit?: number
  ): Observable<any> {
    return this.categoryRepository
      .getCategories(pageNumber, pageSize, search, parentCategory, unit)
      .pipe(map((response) => response));
  }

  /**
   * Gets a single category by ID
   */
  getCategoryById(id: number): Observable<any> {
    return this.categoryRepository
      .getCategoryById(id)
      .pipe(map((response) => response));
  }

  /**
   * Creates a new category
   */
  createCategory(data: any): Observable<any> {
    return this.categoryRepository
      .createCategory(data)
      .pipe(map((response) => response));
  }

  /**
   * Updates an existing category
   */
  updateCategory(data: any): Observable<any> {
    return this.categoryRepository
      .updateCategory(data)
      .pipe(map((response) => response));
  }

  /**
   * Soft deletes a category
   */
  deleteCategory(id: number): Observable<any> {
    return this.categoryRepository
      .deleteCategory(id)
      .pipe(map((response) => response));
  }

  /**
   * Restores a soft-deleted category
   */
  restoreCategory(id: number): Observable<any> {
    return this.categoryRepository
      .restoreCategory(id)
      .pipe(map((response) => response));
  }

  /**
   * Permanently deletes a category
   */
  forceDeleteCategory(id: number): Observable<any> {
    return this.categoryRepository
      .forceDeleteCategory(id)
      .pipe(map((response) => response));
  }

  /**
   * Gets list of deleted categories
   */
  getDeletedCategories(): Observable<any> {
    return this.categoryRepository
      .getDeletedCategories()
      .pipe(map((response) => response));
  }
}
