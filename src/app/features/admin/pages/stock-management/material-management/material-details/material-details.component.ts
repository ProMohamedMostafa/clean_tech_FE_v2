import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Services
import { MaterialService } from '../../../../services/stock-service/material.service';
import { StockService } from '../../../../services/stock-service/stock.service';
import { ProviderService } from '../../../../services/provider.service';
import { CategoryService } from '../../../../services/stock-service/category.service';

// Sub-components
import { IncreaseQualityComponent } from '../increase-quality/increase-quality.component';
import { DecreaseQualityComponent } from '../decrease-quality/decrease-quality.component';
import { MaterialOffcanvasComponent } from '../material-offcanvas/material-offcanvas.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-material-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSnackBarModule,
    IncreaseQualityComponent,
    DecreaseQualityComponent,
    MaterialOffcanvasComponent,
    TranslateModule
  ],
  templateUrl: './material-details.component.html',
  styleUrl: './material-details.component.scss',
})
export class MaterialDetailsComponent implements OnInit {
  @ViewChild(MaterialOffcanvasComponent)
  materialOffcanvas!: MaterialOffcanvasComponent;

  // Material data
  selectedId!: number;
  selectedName!: string;
  selectedQuantity!: number;
  selectedMinThreshold!: number;
  selectedCategoryName!: string;
  selectedCategoryId!: number;
  selectedDescription!: string;
  currentMaterial: any;

  // UI state
  openMenuId: number | null = null;
  showFullDescription = false;
  showAddModal = false;
  showMinusModal = false;
  selectedFileName = '';
  successMessage = '';

  // Data collections
  providers: any[] = [];
  categories: any[] = [];

  // Forms
  addnewMaterial: any = {
    MaterialId: 0,
    ProviderId: 0,
    Quantity: 0,
    Price: 0,
    File: null,
  };
  removenewMaterial: any = {
    MaterialId: 0,
    ProviderId: 0,
    Quantity: 0,
  };

  constructor(
    private route: ActivatedRoute,
    private materialService: MaterialService,
    private stockService: StockService,
    private providerService: ProviderService,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(id)) {
      this.selectedId = id;
      this.getMaterialDetails(id);
    } else {
      console.error('Invalid ID in URL');
      this.showSnackBar('Invalid material ID in URL.', 'Close');
      this.router.navigate(['admin', 'material']);
    }
  }

  /**
   * Fetch material details by ID
   */
  private getMaterialDetails(id: number): void {
    this.materialService.getMaterialById(id).subscribe({
      next: (response) => {
        if (response?.succeeded && response.data) {
          this.mapMaterialData(response.data);
        } else {
          this.handleMaterialNotFound();
        }
      },
      error: (error) => {
        console.error('Error fetching material details:', error);
        this.handleMaterialNotFound();
      },
    });
  }

  /**
   * Map API data to local properties
   */
  private mapMaterialData(data: any): void {
    this.selectedId = data.id;
    this.selectedName = data.name;
    this.selectedQuantity = data.quantity;
    this.selectedMinThreshold = data.minThreshold;
    this.selectedCategoryName = data.categoryName;
    this.selectedCategoryId = data.categoryId;
    this.selectedDescription = data.description;
  }

  /**
   * Handle material not found or deleted
   */
  private handleMaterialNotFound(): void {
    this.showSnackBar(
      'This material has been deleted or no longer exists.',
      'Close'
    );
    this.router.navigate(['admin', 'material']);
  }

  /**
   * Show a snackbar message
   */
  private showSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: ['mat-toolbar', 'mat-warn'],
    });
  }

  /**
   * Load providers on demand (lazy load)
   */
  loadProviders(callback?: () => void): void {
    this.providerService.getPaginatedProviders(1).subscribe({
      next: (response) => {
        if (response?.succeeded) {
          this.providers = response.data;
          if (callback) callback();
        } else {
          this.showSnackBar('Failed to load providers.', 'Close');
        }
      },
      error: (error) => {
        console.error('Error loading providers:', error);
        this.showSnackBar('Error loading providers.', 'Close');
      },
    });
  }

  /**
   * Load categories on demand (lazy load)
   */
  loadCategories(): void {
    this.categoryService.getCategories(1, 100).subscribe({
      next: (response) => {
        if (response?.succeeded) {
          this.categories = response.data?.data || [];
          if (this.materialOffcanvas) {
            this.materialOffcanvas.categories = this.categories;
          }
        } else {
          this.showSnackBar('Failed to load categories.', 'Close');
        }
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.showSnackBar('Error loading categories.', 'Close');
      },
    });
  }

  /**
   * Toggle full/short description
   */
  toggleDescription(): void {
    this.showFullDescription = !this.showFullDescription;
  }

  /**
   * Open add stock modal
   */
  openAddModal(materialId: number): void {
    this.addnewMaterial.MaterialId = materialId;
    this.removenewMaterial.MaterialId = materialId;

    if (!this.providers.length) {
      this.loadProviders(() => {
        this.showAddModal = true;
      });
    } else {
      this.showAddModal = true;
    }
  }

  /**
   * Open remove stock modal
   */
  openMinusModal(materialId: number): void {
    this.removenewMaterial.MaterialId = materialId;

    if (!this.providers.length) {
      this.loadProviders(() => {
        this.showMinusModal = true;
      });
    } else {
      this.showMinusModal = true;
    }
  }

  /**
   * Called after successful stock in
   */
  onAddStockInSuccess(): void {
    this.showAddModal = false;
    this.getMaterialDetails(this.selectedId);
    this.resetAddForm();
  }

  /**
   * Called after successful stock out
   */
  onAddStockOutSuccess(): void {
    this.showMinusModal = false;
    this.getMaterialDetails(this.selectedId);
    this.resetRemoveForm();
  }

  /**
   * Delete material with confirmation
   */
  deleteMaterial(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action will permanently delete the material!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
    }).then((result) => {
      if (result.isConfirmed) {
        this.materialService.deleteMaterial(id).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Material has been deleted.', 'success');
            this.router.navigate(['/admin/material']);
          },
          error: (error) => {
            console.error('Error deleting material:', error);
            Swal.fire(
              'Error!',
              'Failed to delete material. Try again.',
              'error'
            );
          },
        });
      }
    });
  }

  /**
   * Set current material & open offcanvas for editing
   */
  setEditMaterial(): void {
    this.currentMaterial = {
      id: this.selectedId,
      name: this.selectedName,
      minThreshold: this.selectedMinThreshold,
      categoryId: this.selectedCategoryId,
      quantity: this.selectedQuantity,
      description: this.selectedDescription,
    };
    this.openMenuId = null;

    // Ensure categories are loaded
    if (!this.categories.length) {
      this.loadCategories();
    }
    this.materialOffcanvas.categories = this.categories;
    this.materialOffcanvas.showOffcanvas();
  }

  /**
   * Handle file selection
   */
  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedFileName = file.name;
    }
  }

  /**
   * After edit, refresh material details
   */
  onMaterialUpdated(): void {
    this.getMaterialDetails(this.selectedId);
  }

  /**
   * Reset add form
   */
  private resetAddForm(): void {
    this.addnewMaterial = {
      MaterialId: this.selectedId,
      ProviderId: 0,
      Quantity: 0,
      Price: 0,
      File: null,
    };
    this.selectedFileName = '';
  }

  /**
   * Reset remove form
   */
  private resetRemoveForm(): void {
    this.removenewMaterial = {
      MaterialId: this.selectedId,
      ProviderId: 0,
      Quantity: 0,
    };
  }
}
