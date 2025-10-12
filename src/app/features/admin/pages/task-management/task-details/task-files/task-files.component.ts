import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'task-files',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './task-files.component.html',
  styleUrls: ['./task-files.component.scss'],
})
export class TaskFilesComponent {
  @Input() files: any[] = [];
}
