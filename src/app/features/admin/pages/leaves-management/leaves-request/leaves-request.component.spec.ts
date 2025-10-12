import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeavesRequestComponent } from './leaves-request.component';

describe('LeavesRequestComponent', () => {
  let component: LeavesRequestComponent;
  let fixture: ComponentFixture<LeavesRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeavesRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeavesRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
