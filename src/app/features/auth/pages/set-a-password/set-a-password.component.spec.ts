import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetAPasswordComponent } from './set-a-password.component';

describe('SetAPasswordComponent', () => {
  let component: SetAPasswordComponent;
  let fixture: ComponentFixture<SetAPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetAPasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetAPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
