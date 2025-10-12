// sidebar.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuItem } from '../../../../core/models/menuItem.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [RouterLink, TranslateModule],
})
export class SidebarComponent {
  @Input() menuItems: MenuItem[] = [];
  @Input() expandedIndex: number | null = null;
  @Output() toggleSubmenu = new EventEmitter<number>();

  constructor() {}

  hasChildren(item: MenuItem): boolean {
    return !!item?.children?.length;
  }

  trackByMenuItem(index: number, item: MenuItem): string {
    return item.label;
  }
}
