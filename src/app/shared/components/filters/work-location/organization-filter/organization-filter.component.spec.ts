import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationFilterComponent } from './organization-filter.component';

describe('OrganizationFilterComponent', () => {
  let component: OrganizationFilterComponent;
  let fixture: ComponentFixture<OrganizationFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
