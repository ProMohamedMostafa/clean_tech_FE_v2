import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

interface SectionDetails {
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
}
@Component({
  selector: 'app-section-details-info',
  imports: [CommonModule, TranslateModule],
  templateUrl: './section-details-info.component.html',
  styleUrl: './section-details-info.component.scss',
})
export class SectionDetailsInfoComponent {
  @Input() sectionData: SectionDetails | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sectionData']) {
      console.log(
        'sectionData changed:',
        changes['sectionData'].currentValue
      );
    }
  }
}
