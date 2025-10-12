import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

interface BuildingDetails {
  id: number;
  name: string; // City name
  areaId: number; // District/Area ID
  areaName: string; // District/Area name
  cityId: number; // District/Area ID
  cityName: string; // District/Area name
  organizationId: number; // District/Area ID
  organizationName: string; // District/Area name
  countryName: string;
}

@Component({
  selector: 'app-building-details-info',
  imports: [CommonModule, TranslateModule],
  templateUrl: './building-details-info.component.html',
  styleUrl: './building-details-info.component.scss',
})
export class BuildingDetailsInfoComponent {
    @Input() buildingData: BuildingDetails | null = null;
  
    ngOnChanges(changes: SimpleChanges): void {
      if (changes['buildingData']) {
        console.log('buildingData changed:', changes['buildingData'].currentValue);
      }
    }
}
