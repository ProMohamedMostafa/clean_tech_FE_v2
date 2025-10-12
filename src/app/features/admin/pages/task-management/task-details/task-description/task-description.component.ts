import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';

@Component({
  selector: 'task-description',
  imports: [],
  templateUrl: './task-description.component.html',
  styleUrls: ['./task-description.component.scss'],
})
export class TaskDescriptionComponent {
  @Input() task: any;
  @ViewChild('descriptionElement') descriptionElement!: ElementRef;

  isDescriptionCollapsed = true;
  showReadMore = false;

  ngAfterViewInit() {
    this.checkDescriptionOverflow();
  }

  toggleDescription() {
    this.isDescriptionCollapsed = !this.isDescriptionCollapsed;
  }

  private checkDescriptionOverflow() {
    setTimeout(() => {
      const element = this.descriptionElement.nativeElement;
      this.showReadMore = element.scrollHeight > element.clientHeight;
    });
  }
}
