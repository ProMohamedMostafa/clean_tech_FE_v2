import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserActionButtonsComponent } from './user-action-buttons.component';

describe('UserActionButtonsComponent', () => {
  let component: UserActionButtonsComponent;
  let fixture: ComponentFixture<UserActionButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserActionButtonsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserActionButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
