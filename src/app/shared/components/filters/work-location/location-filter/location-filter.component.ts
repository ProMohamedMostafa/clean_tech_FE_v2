// location-filter.component.ts
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FilterBarService } from '../../../../services/filter-bar.service';
import { Observable, of } from 'rxjs';

type FilterType =
  | 'area'
  | 'city'
  | 'organization'
  | 'building'
  | 'floor'
  | 'section'
  | 'point';

@Component({
  selector: 'app-location-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './location-filter.component.html',
  styleUrls: ['./location-filter.component.scss'],
})
export class LocationFilterComponent implements OnInit {
  @Input() filterType: FilterType = 'area';
  @Input() parentId: string | null = null;
  @Input() selectedId: string | null = null;

  @Output() filterChange = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  items: any[] = [];
  childItems: any[] = [];
  isLoading = false;
  isLoadingChildren = false;

  // Mapping of filter types to their child types
  private readonly typeHierarchy: Record<FilterType, FilterType | null> = {
    area: 'city',
    city: 'organization',
    organization: 'building',
    building: 'floor',
    floor: 'section',
    section: 'point',
    point: null,
  };

  // Mapping of filter types to their translation keys
  private readonly typeLabels: Record<FilterType, string> = {
    area: 'AREA',
    city: 'CITY',
    organization: 'ORGANIZATION',
    building: 'BUILDING',
    floor: 'FLOOR',
    section: 'SECTION',
    point: 'POINT',
  };

  constructor(private filterBarService: FilterBarService) {}

  ngOnInit(): void {
    this.loadItems();

    if (this.parentId && this.selectedId) {
      this.loadChildItems(this.parentId);
    }
  }

  get childType(): FilterType | null {
    return this.typeHierarchy[this.filterType];
  }

  get typeLabel(): string {
    return this.typeLabels[this.filterType];
  }

  get childTypeLabel(): string | null {
    return this.childType ? this.typeLabels[this.childType] : null;
  }

  loadItems(): void {
    this.isLoading = true;

    const serviceMethod = this.getServiceMethod();
    serviceMethod().subscribe({
      next: (data: any[]) => {
        this.items = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error(`Error fetching ${this.filterType}s:`, error);
        this.items = [];
        this.isLoading = false;
      },
    });
  }

  loadChildItems(parentId: string): void {
    if (!this.childType) return;

    this.isLoadingChildren = true;
    this.childItems = [];
    this.selectedId = null;

    const serviceMethod = this.getChildServiceMethod();
    serviceMethod(parentId).subscribe({
      next: (data: any[]) => {
        this.childItems = data;
        this.isLoadingChildren = false;
      },
      error: (error: any) => {
        console.error(`Error fetching ${this.childType}s:`, error);
        this.childItems = [];
        this.isLoadingChildren = false;
      },
    });
  }

  private getServiceMethod(): () => Observable<any[]> {
    switch (this.filterType) {
      case 'area':
        return () => this.filterBarService.loadPaginatedAreas();
      case 'city':
        return () => this.filterBarService.loadCitiesPaged();
      case 'organization':
        return () => this.filterBarService.loadOrganizationsPaged();
      case 'building':
        return () => this.filterBarService.loadBuildingsPaged();
      case 'floor':
        return () => this.filterBarService.loadFloorsPaged();
      case 'section':
        return () => this.filterBarService.loadSectionsPaged();
      case 'point':
        return () => this.filterBarService.loadPointsPaged();
      default:
        return () => of([]);
    }
  }

  private getChildServiceMethod(): (id: string) => Observable<any[]> {
    switch (this.childType) {
      case 'city':
        return (id) => this.filterBarService.loadCitiesByArea(+id);
      case 'organization':
        return (id) => this.filterBarService.loadOrganizationsByCity(+id);
      case 'building':
        return (id) => this.filterBarService.loadBuildingsByOrganization(+id);
      case 'floor':
        return (id) => this.filterBarService.loadFloorsByBuilding(+id);
      case 'section':
        return (id) => this.filterBarService.loadSectionsByFloor(+id);
      case 'point':
        return (id) => this.filterBarService.loadPointsBySection(+id);
      default:
        return () => of([]);
    }
  }

  onItemChange(event: Event): void {
    const itemId = (event.target as HTMLSelectElement).value;
    this.parentId = itemId || null;

    if (this.parentId && this.childType) {
      this.loadChildItems(this.parentId);
    } else {
      this.childItems = [];
      this.selectedId = null;
    }
  }

  onChildItemChange(event: Event): void {
    this.selectedId = (event.target as HTMLSelectElement).value || null;
  }

  closeFilterModal(): void {
    this.close.emit();
  }

  applyFilter(): void {
    const filterData = {
      [`selected${
        this.typeLabel.charAt(0).toUpperCase() + this.typeLabel.slice(1)
      }`]: this.parentId,
      ...(this.childType
        ? {
            [`selected${
              this.childTypeLabel!.charAt(0).toUpperCase() +
              this.childTypeLabel!.slice(1)
            }`]: this.selectedId,
          }
        : {}),
    };
    this.filterChange.emit(filterData);
  }
}
