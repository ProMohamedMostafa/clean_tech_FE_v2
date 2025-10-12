import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskTeamComponent } from './task-team.component';

describe('TaskTeamComponent', () => {
  let component: TaskTeamComponent;
  let fixture: ComponentFixture<TaskTeamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTeamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
