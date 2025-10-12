import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ShiftService } from '../../../services/shift.service';
import Swal from 'sweetalert2';
import { OrganizationSectionComponent } from "./organization-section/organization-section.component";
import { SectionSectionComponent } from "./section-section/section-section.component";
import { BuildingSectionComponent } from "./building-section/building-section.component";
import { FloorSectionComponent } from "./floor-section/floor-section.component";

@Component({
  selector: 'app-shift-details',
  imports: [FormsModule, CommonModule, MatSnackBarModule, TranslateModule, OrganizationSectionComponent, SectionSectionComponent, BuildingSectionComponent, FloorSectionComponent],
  templateUrl: './shift-details.component.html',
  styleUrl: './shift-details.component.scss',
})
export class ShiftDetailsComponent {
  profileData: any;
  tasks: any[] = []; // Array to hold tasks

  selectedStatus: any = null; // Track the selected status filter
  selectedTab: string = 'organization'; // Default selected tab
  search: any = null; // Track the selected status filter
  userId: string | null = null; // Store user ID from route parameters
  shift!: any;
  shiftData: any; // Store shift data

  // Declare properties in the component
  organizations: any[] = [];
  buildings: any[] = [];
  floors: any[] = [];
  sections: any[] = [];

  constructor(
    private activatedRoute: ActivatedRoute, // Inject ActivatedRoute to access route params
    private ShiftService: ShiftService,
    private snackBar: MatSnackBar, // Inject MatSnackBar
    private location: Location, // inject Location
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get the 'id' from the route parameters
    this.activatedRoute.paramMap.subscribe((params) => {
      this.userId = params.get('id'); // Retrieve 'id' from the route parameters
      this.shift = params.get('id'); // Retrieve 'id' from the route parameters
    });

    this.loadShiftDetails(this.shift); // Fetch Shift details if ID is available
  }

  // Function to fetch the Shift details using ShiftService

  loadShiftDetails(id: number): void {
    this.ShiftService.getShiftDetailsById(id).subscribe({
      next: (response: any) => {
        if (response && response.succeeded && response.data) {
          this.shiftData = response.data; // Store the whole shift data

          // ✅ Separate the nested entities
          this.organizations = response.data.organizations || [];
          this.buildings = response.data.building || [];
          this.floors = response.data.floors || [];
          this.sections = response.data.sections || [];
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Access Denied',
            text: 'You do not have access to this shift.',
            confirmButtonText: 'Back to Shifts',
          }).then(() => {
            this.location.back(); // Navigate back after closing alert
          });
        }
      },
      error: (err) => {
        console.error('Error fetching shift details:', err);
        Swal.fire({
          icon: 'error',
          title: 'Access Denied',
          text: 'You do not have access to this shift.',
          confirmButtonText: 'Back to Shifts',
        }).then(() => {
          this.location.back(); // Navigate back after closing alert
        });
      },
    });
  }

  // Show Angular Material Snackbar
  private showSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000, // Show for 5 seconds
      verticalPosition: 'top', // Position at the top
      horizontalPosition: 'center', // Centered horizontally
      panelClass: ['mat-toolbar', 'mat-warn'], // Styling
    });
  }

  // Method to handle tab selection
  selectTab(tab: string): void {
    this.selectedTab = tab; // Update the selected tab
  }
}
