import { Component, Input } from '@angular/core';
import {  Router } from '@angular/router';
import { getUserRole } from '../../../../../../core/helpers/auth.helpers';

@Component({
  selector: 'app-building-section',
  imports: [],
  templateUrl: './building-section.component.html',
  styleUrl: './building-section.component.scss',
})
export class BuildingSectionComponent {
  @Input() buildings: any;
  userRole: string = getUserRole().toLowerCase(); // default fallback

  constructor(private router: Router) {}

  navigateToAddUser(id: any): void {
    this.router.navigate([`/${this.userRole}/building-details/`, id]);
  }
}
