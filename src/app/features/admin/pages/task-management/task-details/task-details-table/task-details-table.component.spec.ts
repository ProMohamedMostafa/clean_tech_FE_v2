import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDetailsTableComponent } from './task-details-table.component';

describe('TaskDetailsTableComponent', () => {
  let component: TaskDetailsTableComponent;
  let fixture: ComponentFixture<TaskDetailsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDetailsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskDetailsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
