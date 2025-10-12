import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

interface PointDetails {
  id: number;
  name: string; // City name
  areaId: number; // District/Area ID
  areaName: string; // District/Area name
  cityId: number; // District/Area ID
  cityName: string; // District/Area name
  organizationId: number; // District/Area ID
  organizationName: string; // District/Area name
  buildingId: number; // District/Area ID
  buildingName: string; // District/Area name
  countryName: string;
  floorId: number; // District/Area ID
  floorName: string; // District/Area name
  sectionId: number; // District/Area ID
  sectionName: string; // District/Area name
}
@Component({
  selector: 'app-point-details-info',
  imports: [CommonModule, TranslateModule],
  templateUrl: './point-details-info.component.html',
  styleUrl: './point-details-info.component.scss',
})
export class PointDetailsInfoComponent {
  @Input() pointData: PointDetails | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pointData']) {
      console.log('pointData changed:', changes['pointData'].currentValue);
    }
  }
}
