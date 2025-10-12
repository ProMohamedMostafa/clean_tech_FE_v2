import { Component, Input } from '@angular/core';
import {  Router } from '@angular/router';
import { getUserRole } from '../../../../../../core/helpers/auth.helpers';

@Component({
  selector: 'app-organization-section',
  imports: [],
  templateUrl: './organization-section.component.html',
  styleUrl: './organization-section.component.scss',
})
export class OrganizationSectionComponent {
  shifts: any[] = []; // To store the fetched shifts data
  shiftId: number = 0; // Default value, will be updated from the URL
  @Input() organizations: any;
  userRole: string = getUserRole().toLowerCase(); // default fallback

  constructor(

    private router: Router
  ) {}

  navigateToAddUser(id: any): void {
    this.router.navigate([`/${this.userRole}/organization-details/`, id]);
  }
}
