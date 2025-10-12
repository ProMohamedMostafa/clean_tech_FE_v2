import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserGenderSectionComponent } from './user-gender-section.component';

describe('UserGenderSectionComponent', () => {
  let component: UserGenderSectionComponent;
  let fixture: ComponentFixture<UserGenderSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserGenderSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserGenderSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
