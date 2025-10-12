import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerDashboardCardsComponent } from './manager-dashboard-cards.component';

describe('ManagerDashboardCardsComponent', () => {
  let component: ManagerDashboardCardsComponent;
  let fixture: ComponentFixture<ManagerDashboardCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerDashboardCardsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerDashboardCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
