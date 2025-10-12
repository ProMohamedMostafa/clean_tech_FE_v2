import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

interface OrganizationDetails {
  id: number;
  name: string; // City name
  areaId: number; // District/Area ID
  areaName: string; // District/Area name
  cityId: number; // District/Area ID
  cityName: string; // District/Area name
  countryName: string;
}

@Component({
  selector: 'app-organization-details-info',
  imports: [CommonModule, TranslateModule],
  templateUrl: './organization-details-info.component.html',
  styleUrl: './organization-details-info.component.scss',
})
export class OrganizationDetailsInfoComponent {
  @Input() organizationData: OrganizationDetails | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['organizationData']) {
      console.log('organizationData changed:', changes['organizationData'].currentValue);
    }
  }
}
