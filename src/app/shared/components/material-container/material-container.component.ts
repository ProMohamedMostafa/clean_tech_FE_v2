import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MaterialCardComponent } from '../material-card/material-card.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-material-container',
  standalone: true,
  imports: [MaterialCardComponent, CommonModule],
  templateUrl: './material-container.component.html',
  styleUrl: './material-container.component.scss',
})
export class MaterialContainerComponent {
  @Input() materials: any[] = []; // Initialize with empty array
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() totalCount = 0;
  @Input() pageSize = 8;

  @Output() pageChanged = new EventEmitter<number>();
  @Output() pageSizeChanged = new EventEmitter<number>();
  @Output() viewMaterial = new EventEmitter<any>();
  @Output() editMaterial = new EventEmitter<any>();
  @Output() deleteMaterial = new EventEmitter<any>();
  @Output() addQuantity = new EventEmitter<any>();
  @Output() reduceQuantity = new EventEmitter<any>();

  getPageNumbers(): number[] {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(
      1,
      this.currentPage - Math.floor(maxVisiblePages / 2)
    );
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > this.totalPages) {
      endPage = this.totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  onPageChange(page: number): void {
    this.pageChanged.emit(page);
  }

  onViewMaterial(material: any): void {
    this.viewMaterial.emit(material);
  }

  onEditMaterial(material: any): void {
    this.editMaterial.emit(material);
  }

  onDeleteMaterial(material: any): void {
    this.deleteMaterial.emit(material);
  }

  onAddQuantity(material: any): void {
    this.addQuantity.emit(material);
  }

  onReduceQuantity(material: any): void {
    this.reduceQuantity.emit(material);
  }
}
