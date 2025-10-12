import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletedCitiesComponent } from './deleted-cities.component';

describe('DeletedCitiesComponent', () => {
  let component: DeletedCitiesComponent;
  let fixture: ComponentFixture<DeletedCitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletedCitiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletedCitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
