import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'task-details-table',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './task-details-table.component.html',
  styleUrls: ['./task-details-table.component.scss'],
})
export class TaskDetailsTableComponent {
  @Input() task: any;
}
