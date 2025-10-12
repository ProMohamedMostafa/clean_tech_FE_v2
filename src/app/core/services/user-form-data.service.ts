// src/app/core/services/user-form-data.service.ts
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RoleService } from './role.service';
import { CountryService } from '../../features/admin/services/work-location/country.service';
import { ProviderService } from '../../features/admin/services/provider.service';

@Injectable({ providedIn: 'root' })
export class UserFormDataService {
  constructor(
    private countryService: CountryService,
    private providerService: ProviderService,
    private roleService: RoleService
  ) {}

  loadInitialData(): Observable<{
    countries: any[];
    providers: any[];
    roles: any[];
    nationalities: any[]; // Add this to the return type
  }> {
    return forkJoin({
      countries: this.countryService
        .getNationalities()
        .pipe(
          map((response) =>
            Array.isArray(response?.data) ? response.data : []
          )
        ),
      providers: this.providerService
        .getPaginatedProviders()
        .pipe(
          map((res) =>
            Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
          )
        ),
      roles: this.roleService.getRoles().pipe(
        map((roles) =>
          roles.map((role) => ({
            label: role.name,
            value: role.id,
          }))
        )
      ),
    }).pipe(
      map((data) => ({
        ...data,
        // Generate nationalities from countries if not provided separately
        nationalities: this.generateNationalitiesFromCountries(data.countries),
      }))
    );
  }

  private generateNationalitiesFromCountries(countries: any[]): any[] {
    return countries.map((country) => ({
      id: country.id,
      name: country.name,
      code: country.code || country.name.toLowerCase(),
    }));
  }
}
