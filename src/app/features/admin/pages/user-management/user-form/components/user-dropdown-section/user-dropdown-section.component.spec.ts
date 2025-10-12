import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDropdownSectionComponent } from './user-dropdown-section.component';

describe('UserDropdownSectionComponent', () => {
  let component: UserDropdownSectionComponent;
  let fixture: ComponentFixture<UserDropdownSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDropdownSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserDropdownSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
