import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-recieve-task-actions',
  imports: [FormsModule],
  templateUrl: './recieve-task-actions.component.html',
  styleUrl: './recieve-task-actions.component.scss',
})
export class RecieveTaskActionsComponent {
  @Input() task: any;
  @Output() action = new EventEmitter<{ type: string; notes?: string }>();
  @Input() statusId: any;
  @Input() isCreator: boolean = false; // Add this input

  userRole: string | null = null;
  completionNotes = '';
  taskStatusId: number | null = null; // Store statusId here

  ngOnInit() {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        this.userRole = parsedUser?.role?.toLowerCase(); // e.g., "admin"
      } catch (error) {
        console.error('Invalid userData in localStorage:', error);
      }
    }
  }

  ngOnChanges(): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    // Store the statusId from the input task
    this.taskStatusId = this.statusId;

    console.log("task status" , this.taskStatusId);
    
  }

  handleAction(type: string) {
    if (type === 'Complete') {
      this.action.emit({ type, notes: this.completionNotes });
    } else {
      this.action.emit({ type });
    }
  }

  // ✅ Role helpers
  isAdmin(): boolean {
    return this.userRole === 'admin';
  }

  isManager(): boolean {
    return this.userRole === 'manager';
  }

  isSupervisor(): boolean {
    return this.userRole === 'supervisor';
  }

  isCleaner(): boolean {
    return this.userRole === 'cleaner';
  }
}
