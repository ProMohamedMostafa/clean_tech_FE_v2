import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationSectionComponent } from './organization-section.component';

describe('OrganizationSectionComponent', () => {
  let component: OrganizationSectionComponent;
  let fixture: ComponentFixture<OrganizationSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
