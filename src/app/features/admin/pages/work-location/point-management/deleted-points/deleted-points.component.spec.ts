import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletedPointsComponent } from './deleted-points.component';

describe('DeletedPointsComponent', () => {
  let component: DeletedPointsComponent;
  let fixture: ComponentFixture<DeletedPointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletedPointsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletedPointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
