import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '../../../services/user.service';
import { UserRepository } from '../../../repositories/user.repository';

@Component({
  selector: 'app-user-cards',
  templateUrl: './user-cards.component.html',
  styleUrl: './user-cards.component.css', // typo fixed from `styleUrl`
  imports: [TranslateModule],
})
export class UserCardsComponent implements OnInit {
  totalUsers: number = 0;
  totalManagers: number = 0;
  totalSupervisors: number = 0;
  totalCleaners: number = 0;

  constructor(private userService: UserRepository) {}

  ngOnInit(): void {
    this.userService.getUsersCount().subscribe({
      next: (res) => {
        if (res?.succeeded && res?.data) {
          const labels = res.data.labels;
          const values = res.data.values;

          this.totalUsers = res.data.total;

          labels.forEach((label: string, index: number) => {
            const value = values[index];
            switch (label.toLowerCase()) {
              case 'manager':
                this.totalManagers = value;
                break;
              case 'supervisor':
                this.totalSupervisors = value;
                break;
              case 'cleaner':
                this.totalCleaners = value;
                break;
              // You can add other roles if needed
            }
          });
        }
      },
      error: (err) => {
        console.error('Error fetching user counts:', err);
      },
    });
  }
}
