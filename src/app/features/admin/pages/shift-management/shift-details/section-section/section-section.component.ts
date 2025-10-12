import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { getUserRole } from '../../../../../../core/helpers/auth.helpers';

@Component({
  selector: 'app-section-section',
  imports: [],
  templateUrl: './section-section.component.html',
  styleUrl: './section-section.component.scss',
})
export class SectionSectionComponent {
  shifts: any[] = []; // To store the fetched shifts data
  shiftId: number = 0; // Default value, will be updated from the URL
  @Input() sections: any;
  userRole: string = getUserRole().toLowerCase(); // default fallback

  constructor(private router: Router) {}

  navigateToAddUser(id: any): void {
    this.router.navigate([`/${this.userRole}/section-details/`, id]);
  }
}
