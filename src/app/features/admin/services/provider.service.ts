import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProviderRepository } from '../repositories/provider.repository';
import { ProviderResponse } from '../models/provider.model';

@Injectable({
  providedIn: 'root',
})
export class ProviderService {
  constructor(private repository: ProviderRepository) {}

  // Get all providers
  getProviders(): Observable<ProviderResponse> {
    return this.repository.getPaginated().pipe(
      map((res) => {
        // Add transformation if needed
        return res;
      })
    );
  }

  getPaginatedProviders(
    pageNumber: number = 1,
    pageSize?: number,
    searchQuery?: string
  ): Observable<any> {
    if (pageNumber < 1) pageNumber = 1;
    return this.repository
      .getPaginated(pageNumber, pageSize, searchQuery)
      .pipe(map((res) => res?.data ?? {}));
  }

  // Get provider by ID
  getProviderById(providerId: number): Observable<ProviderResponse> {
    return this.repository.getById(providerId);
  }

  // Create new provider
  createProvider(providerData: any): Observable<ProviderResponse> {
    // Clean data
    providerData.name = providerData.name.trim();

    return this.repository.create(providerData);
  }

  // Edit provider
  editProvider(providerData: any): Observable<ProviderResponse> {
    providerData.name = providerData.name?.trim();

    return this.repository.update(providerData);
  }

  // Soft delete provider
  deleteProvider(providerId: number): Observable<ProviderResponse> {
    return this.repository.delete(providerId);
  }

  // Force delete provider
  forceDeleteProvider(providerId: string): Observable<ProviderResponse> {
    return this.repository.forceDelete(providerId);
  }

  // Restore provider
  restoreProvider(providerId: number): Observable<ProviderResponse> {
    return this.repository.restore(providerId);
  }

  // Get all deleted providers
  getDeletedProviders(): Observable<ProviderResponse> {
    return this.repository.getDeleted().pipe(
      map((res) => {
        // Optional: filter or sort if needed
        return res;
      })
    );
  }
}
