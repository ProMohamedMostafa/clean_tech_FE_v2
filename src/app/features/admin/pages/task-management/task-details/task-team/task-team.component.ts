import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { getUserRole } from '../../../../../../core/helpers/auth.helpers';

@Component({
  selector: 'task-team',
  imports: [TranslateModule],
  templateUrl: './task-team.component.html',
  styleUrls: ['./task-team.component.scss'],
})
export class TaskTeamComponent {
  @Input() users: any[] = [];
  userRole: string = getUserRole().toLowerCase();

  constructor(private router: Router) {}

  goToUserDetails(userId: number | string): void {
    // Prevent navigation if the current user is a cleaner
    if (this.userRole === 'cleaner') {
      return;
    }

    // Otherwise, navigate to the user details page
    this.router.navigate([`/${this.userRole}/user-details`, userId]);
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;

    // Use bracket notation to satisfy TypeScript strict mode
    if (!imgElement.dataset['errorHandled']) {
      imgElement.src = 'assets/default-avatar.png';
      imgElement.dataset['errorHandled'] = 'true';
    }
  }
}
