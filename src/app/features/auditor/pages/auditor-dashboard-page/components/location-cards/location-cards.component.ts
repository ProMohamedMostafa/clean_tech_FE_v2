import { Component, OnInit } from '@angular/core';
import { AuditService } from '../../../../services/audit.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-location-cards',
  templateUrl: './location-cards.component.html',
  styleUrls: ['./location-cards.component.scss'],
  imports:[TranslateModule]
})
export class LocationCardsComponent implements OnInit {
  counts: any = null;

  constructor(private auditService: AuditService) {}

  ngOnInit(): void {
    this.loadCounts();
  }

  loadCounts() {
    this.auditService.getLocationsCount().subscribe((data) => {
      this.counts = data;
    });
  }
}
