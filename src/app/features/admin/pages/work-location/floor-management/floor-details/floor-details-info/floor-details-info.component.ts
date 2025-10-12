import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

interface FloorDetails {
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
}
@Component({
  selector: 'app-floor-details-info',
  imports: [CommonModule, TranslateModule],
  templateUrl: './floor-details-info.component.html',
  styleUrl: './floor-details-info.component.scss',
})
export class FloorDetailsInfoComponent {
   @Input() floorData: FloorDetails | null = null;
    
      ngOnChanges(changes: SimpleChanges): void {
        if (changes['floorData']) {
          console.log('floorData changed:', changes['floorData'].currentValue);
        }
      }
}
