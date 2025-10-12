import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'task-header',
  imports: [TranslateModule],
  templateUrl: './task-header.component.html',
  styleUrls: ['./task-header.component.scss'],
})
export class TaskHeaderComponent {
  @Input() task: any;
  @Output() edit = new EventEmitter<number>();
  @Input() showEditButton: boolean = false;
  ngOnInit(): void {}

 
}
