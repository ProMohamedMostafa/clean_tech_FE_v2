import { Component, Input } from '@angular/core';
import {  Router } from '@angular/router';
import { getUserRole } from '../../../../../../core/helpers/auth.helpers';

@Component({
  selector: 'app-floor-section',
  imports: [],
  templateUrl: './floor-section.component.html',
  styleUrl: './floor-section.component.scss',
})
export class FloorSectionComponent {
  @Input() floors: any;
  userRole: string = getUserRole().toLowerCase();

  constructor(private router: Router) {}

  navigateToAddUser(id: any): void {
    this.router.navigate([`/${this.userRole}/floor-details/`, id]);
  }
}
