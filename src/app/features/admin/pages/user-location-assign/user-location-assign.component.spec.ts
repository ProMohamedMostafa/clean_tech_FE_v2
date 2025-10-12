import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserLocationAssignComponent } from './user-location-assign.component';

describe('UserLocationAssignComponent', () => {
  let component: UserLocationAssignComponent;
  let fixture: ComponentFixture<UserLocationAssignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserLocationAssignComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserLocationAssignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
