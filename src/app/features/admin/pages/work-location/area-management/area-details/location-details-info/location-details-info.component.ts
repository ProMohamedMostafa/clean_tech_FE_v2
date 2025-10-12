import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

interface AreaDetails {
  id: number;
  name: string;
  countryName: string;
}

@Component({
  selector: 'app-location-details-info',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './location-details-info.component.html',
  styleUrl: './location-details-info.component.scss',
})
export class LocationDetailsInfoComponent {
  @Input() areaData: AreaDetails | null = null;
}
