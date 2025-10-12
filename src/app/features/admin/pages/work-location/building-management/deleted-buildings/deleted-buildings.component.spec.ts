import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletedBuildingsComponent } from './deleted-buildings.component';

describe('DeletedBuildingsComponent', () => {
  let component: DeletedBuildingsComponent;
  let fixture: ComponentFixture<DeletedBuildingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletedBuildingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletedBuildingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
