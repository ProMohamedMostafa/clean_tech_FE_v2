import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDetailsInfoComponent } from './user-details-info.component';

describe('UserDetailsInfoComponent', () => {
  let component: UserDetailsInfoComponent;
  let fixture: ComponentFixture<UserDetailsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDetailsInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserDetailsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
