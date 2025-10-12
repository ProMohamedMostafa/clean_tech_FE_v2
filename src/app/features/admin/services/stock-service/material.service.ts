import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { MaterialRepository } from '../../repositories/stock-repo/material.repository';

@Injectable({
  providedIn: 'root',
})
export class MaterialService {
  constructor(private materialRepository: MaterialRepository) {}

  /**
   * Fetches materials with pagination and filtering
   */
  getMaterials(
    pageNumber: number,
    pageSize?: number,
    search?: string,
    category?: number
  ): Observable<any> {
    return this.materialRepository
      .getMaterials(pageNumber, pageSize, search, category)
      .pipe(map((response) => response));
  }

  /**
   * Gets a single material by ID
   */
  getMaterialById(id: number): Observable<any> {
    return this.materialRepository
      .getMaterialById(id)
      .pipe(map((response) => response));
  }

  /**
   * Creates a new material
   */
  createMaterial(data: any): Observable<any> {
    return this.materialRepository
      .createMaterial(data)
      .pipe(map((response) => response));
  }

  /**
   * Updates an existing material
   */
  updateMaterial(data: any): Observable<any> {
    return this.materialRepository
      .updateMaterial(data)
      .pipe(map((response) => response));
  }

  /**
   * Soft deletes a material
   */
  deleteMaterial(id: number): Observable<any> {
    return this.materialRepository
      .deleteMaterial(id)
      .pipe(map((response) => response));
  }

  /**
   * Restores a soft-deleted material
   */
  restoreMaterial(id: number): Observable<any> {
    return this.materialRepository
      .restoreMaterial(id)
      .pipe(map((response) => response));
  }

  /**
   * Permanently deletes a material
   */
  forceDeleteMaterial(id: number): Observable<any> {
    return this.materialRepository
      .forceDeleteMaterial(id)
      .pipe(map((response) => response));
  }

  /**
   * Gets list of deleted materials
   */
  getDeletedMaterials(): Observable<any> {
    return this.materialRepository
      .getDeletedMaterials()
      .pipe(map((response) => response));
  }
}
