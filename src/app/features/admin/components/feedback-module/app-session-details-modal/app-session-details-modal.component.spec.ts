import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppSessionDetailsModalComponent } from './app-session-details-modal.component';

describe('AppSessionDetailsModalComponent', () => {
  let component: AppSessionDetailsModalComponent;
  let fixture: ComponentFixture<AppSessionDetailsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppSessionDetailsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppSessionDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
