import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-material-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './material-card.component.html',
  styleUrl: './material-card.component.scss',
})
export class MaterialCardComponent {
  @Input() material: any;
  @Output() viewMaterial = new EventEmitter<any>();
  @Output() editMaterial = new EventEmitter<any>();
  @Output() deleteMaterial = new EventEmitter<any>();
  @Output() addQuantity = new EventEmitter<any>();
  @Output() reduceQuantity = new EventEmitter<any>();

  isMenuOpen = false;

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  onView(): void {
    this.closeMenu();
    this.viewMaterial.emit(this.material);
  }

  onEdit(): void {
    this.closeMenu();
    this.editMaterial.emit(this.material);
  }

  onDelete(): void {
    this.closeMenu();
    this.deleteMaterial.emit(this.material);
  }

  onAdd(): void {
    this.addQuantity.emit(this.material);
  }

  onReduce(): void {
    this.reduceQuantity.emit(this.material);
  }
}
