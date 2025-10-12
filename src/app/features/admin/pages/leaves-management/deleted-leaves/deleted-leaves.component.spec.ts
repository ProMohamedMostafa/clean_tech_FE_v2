import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletedLeavesComponent } from './deleted-leaves.component';

describe('DeletedLeavesComponent', () => {
  let component: DeletedLeavesComponent;
  let fixture: ComponentFixture<DeletedLeavesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletedLeavesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletedLeavesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
