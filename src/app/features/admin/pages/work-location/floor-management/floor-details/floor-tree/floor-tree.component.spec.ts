import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloorTreeComponent } from './floor-tree.component';

describe('FloorTreeComponent', () => {
  let component: FloorTreeComponent;
  let fixture: ComponentFixture<FloorTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloorTreeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloorTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
