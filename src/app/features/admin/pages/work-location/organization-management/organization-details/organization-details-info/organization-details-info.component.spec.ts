import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationDetailsInfoComponent } from './organization-details-info.component';

describe('OrganizationDetailsInfoComponent', () => {
  let component: OrganizationDetailsInfoComponent;
  let fixture: ComponentFixture<OrganizationDetailsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationDetailsInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationDetailsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
