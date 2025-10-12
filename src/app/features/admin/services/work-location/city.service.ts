import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  City,
  CityPaginationData,
  CityTreeResponse,
  CityWithUsers,
  CreateEditCityModel,
} from '../../models/work-location/city.model';

import { CityRepository } from '../../repositories/work-location/city.repository';

@Injectable({
  providedIn: 'root',
})
export class CityService {
  constructor(private cityRepo: CityRepository) {}

  /**
   * جلب بيانات المدن بشكل مرقم مع تطبيق فلاتر
   */
  getCitiesPaged(filters: {
    PageNumber?: number;
    PageSize?: number;
    SearchQuery?: string;
    area?: number;
    Country?: string;
  }): Observable<CityPaginationData> {
    return this.cityRepo
      .getPaginatedCities(filters)
      .pipe(map((response) => response.data));
  }

  /**
   * جلب مدينة واحدة بالتفصيل
   */
  getCityById(id: number): Observable<City> {
    return this.cityRepo.getCityById(id).pipe(map((resp) => resp.data));
  }

  /**
   * إنشاء مدينة جديدة
   */
  createCity(city: CreateEditCityModel): Observable<City> {
    return this.cityRepo.createCity(city).pipe(map((resp) => resp.data));
  }

  /**
   * تحديث بيانات مدينة موجودة
   */
  updateCity(city: CreateEditCityModel): Observable<City> {
    return this.cityRepo.editCity(city).pipe(map((resp) => resp.data));
  }

  /**
   * حذف مدينة (حذف ناعم)
   */
  softDeleteCity(id: number): Observable<void> {
    return this.cityRepo.deleteCity(id).pipe(map((resp) => {}));
  }

  /**
   * استعادة مدينة بعد حذفها ناعماً
   */
  restoreCity(id: number): Observable<void> {
    return this.cityRepo.restoreCity(id).pipe(map((resp) => {}));
  }

  /**
   * حذف نهائي للمدينة من قاعدة البيانات
   */
  forceDeleteCity(id: number): Observable<void> {
    return this.cityRepo.forceDeleteCity(id).pipe(map((resp) => {}));
  }

  /**
   * جلب المدن المحذوفة (ناعماً)
   */
  getDeletedCities(): Observable<City[]> {
    return this.cityRepo.getDeletedCities().pipe(map((resp) => resp.data));
  }

  /**
   * جلب الهيكل الهرمي الكامل للمدينة
   */
  getCityHierarchy(id: number): Observable<CityTreeResponse> {
    return this.cityRepo.getCityTreeById(id).pipe(map((resp) => resp.data));
  }

  /**
   * جلب المدينة مع المستخدمين المعينين لها
   */
  getCityWithUsers(id: number): Observable<any> {
    return this.cityRepo.getCityWithUsers(id).pipe(map((resp) => resp));
  }

  /**
   * تعيين مستخدمين للمدينة
   */
  assignUsersToCity(cityId: number, userIds: number[]): Observable<void> {
    return this.cityRepo
      .assignUsersToCity({ cityId, userIds })
      .pipe(map(() => {}));
  }

  /**
   * جلب المدن بناءً على المنطقة
   */
  getCitiesByArea(areaId: number): Observable<City[]> {
    return this.cityRepo.getCitiesByArea(areaId).pipe(map((resp) => resp.data));
  }

  getCityWithUser(cityId: string | number): Observable<any> {
    return this.cityRepo.getCityWithUser(cityId).pipe(map((resp) => resp.data));
  }

  /**
   * جلب الهيكل الشجري للمدينة بصيغة مخصصة
   */
  getCustomCityTree(cityId: number): Observable<any> {
    return this.cityRepo.getCustomCityTree(cityId).pipe(map((res) => res));
  }
}
