import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

interface CityDetails {
  id: number;
  name: string; // City name
  areaId: number; // District/Area ID
  areaName: string; // District/Area name
  countryName: string;
}

@Component({
  selector: 'app-location-details-info',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './location-details-info.component.html',
  styleUrl: './location-details-info.component.scss',
})
export class LocationDetailsInfoComponent implements OnChanges {
  @Input() cityData: CityDetails | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cityData']) {
      console.log('cityData changed:', changes['cityData'].currentValue);
    }
  }
}
