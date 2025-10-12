import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecieveTaskActionsComponent } from './recieve-task-actions.component';

describe('RecieveTaskActionsComponent', () => {
  let component: RecieveTaskActionsComponent;
  let fixture: ComponentFixture<RecieveTaskActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecieveTaskActionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecieveTaskActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
