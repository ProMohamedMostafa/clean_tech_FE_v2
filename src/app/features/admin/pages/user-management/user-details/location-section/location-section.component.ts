import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-location-section',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './location-section.component.html',
  styleUrl: './location-section.component.scss',
})
export class LocationSectionComponent {
  @Input() userLevelData: any | null = null;
  @Input() loading: boolean = false;
  @Input() error: string = '';
  @Input() myRole: string = '';
  @Input() filterText: string = '';

  // Navigation handlers passed from parent
  @Input() navigateToArea!: (areaId: number) => void;
  @Input() navigateToCity!: (cityId: number) => void;
  @Input() navigateToBuilding!: (buildingId: number) => void;
  @Input() navigateToFloor!: (floorId: number) => void;
  @Input() navigateToSection!: (sectionId: number) => void;
  @Input() navigateToPoint!: (pointId: number) => void;
  @Input() retryLoading!: () => void;
  @Input() hasExportableData!: () => boolean;
}
