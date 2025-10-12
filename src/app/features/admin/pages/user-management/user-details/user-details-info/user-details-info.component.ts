// user-details-info.component.ts
import { Component, Input } from '@angular/core';
import { UserModel } from '../../../../models/user.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-user-details-info',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './user-details-info.component.html',
  styleUrl: './user-details-info.component.scss',
})
export class UserDetailsInfoComponent {
  @Input() user: UserModel | null = null;

  getGenderText(genderId?: number): string {
    if (genderId === undefined || genderId === null) return 'N/A';

    const genderMap: { [key: number]: string } = {
      0: 'Male',
      1: 'Female',
      // Add more if your system supports more genders
    };

    return genderMap[genderId] || 'N/A';
  }
}
