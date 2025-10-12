import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FilterBarService } from '../../../services/filter-bar.service';
import { CategoryService } from '../../../../features/admin/services/stock-service/category.service';

interface DropdownItem {
  id: number;
  name: string;
}

@Component({
  selector: 'app-transactions-filter',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './transactions-filter.component.html',
  styleUrls: ['./transactions-filter.component.scss'],
})
export class TransactionsFilterComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() filterChange = new EventEmitter<any>();

  // Screen size detection
  isSmallScreen: boolean = false;

  // Filter properties
  selectedCategory: string | null = null;
  selectedType: string | null = null;
  selectedUser: string | null = null;
  selectedProvider: string | null = null;
  dateFrom: string | null = null;
  dateTo: string | null = null;

  // Data collections
  categories: DropdownItem[] = [];
  types: any[] = [
    { id: '0', name: 'Incoming' },
    { id: '1', name: 'Outgoing' },
  ];
  users: DropdownItem[] = [];
  providers: DropdownItem[] = [];

  // Loading states
  loadingCategories: boolean = false;
  loadingUsers: boolean = false;
  loadingProviders: boolean = false;
  loadError: boolean = false;

  constructor(
    private filterBarService: FilterBarService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadUsers();
    this.loadProviders();
    this.updateScreenSize();
    window.addEventListener('resize', this.updateScreenSize.bind(this));
  }

  // UI Helper Methods
  updateScreenSize(): void {
    this.isSmallScreen = window.innerWidth <= 768;
  }

  hasActiveFilters(): boolean {
    return !!(
      this.dateFrom ||
      this.dateTo ||
      this.selectedCategory ||
      this.selectedType ||
      this.selectedUser ||
      this.selectedProvider
    );
  }

  // Filter Management Methods
  resetFilters(): void {
    this.dateFrom = null;
    this.dateTo = null;
    this.selectedCategory = null;
    this.selectedType = null;
    this.selectedUser = null;
    this.selectedProvider = null;
  }

  emitFilterData(): void {
    const filterData = {
      categoryId: this.selectedCategory,
      type: this.selectedType,
      userId: this.selectedUser,
      providerId: this.selectedProvider,
      startDate: this.dateFrom,
      endDate: this.dateTo,
    };
    this.filterChange.emit(filterData);
  }

  // Data Loading Methods
  loadCategories(): void {
    this.loadingCategories = true;
    this.categoryService.getCategories(1, 100).subscribe({
      next: (response: any) => {
        if (response && response.succeeded) {
          this.categories = response.data?.data || [];
        }
        this.loadingCategories = false;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.loadingCategories = false;
        this.loadError = true;
      },
    });
  }

  loadUsers(): void {
    this.loadingUsers = true;
    this.filterBarService.loadPaginatedUsers(1, 100).subscribe({
      next: (response) => {
        this.users = response.data.data.map((user: any) => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
        }));
        this.loadingUsers = false;
      },
      error: (err) => {
        console.error('Error fetching creators:', err);
        this.loadingUsers = false;
      },
    });
  }

  loadProviders(): void {
    this.loadingProviders = true;
    this.filterBarService.loadProviders().subscribe({
      next: (data) => {
        this.providers = data;
        this.loadingProviders = false;
      },
      error: (err) => {
        console.error('Error fetching providers:', err);
        this.loadingProviders = false;
        this.loadError = true;
      },
    });
  }

  // Modal Control Methods
  closeFilterModal(): void {
    this.close.emit();
  }

  applyFilter(): void {
    this.emitFilterData();
    this.close.emit();
  }
}
