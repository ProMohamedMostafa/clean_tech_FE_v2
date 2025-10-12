import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionsFilterComponent } from './transactions-filter.component';

describe('TransactionsFilterComponent', () => {
  let component: TransactionsFilterComponent;
  let fixture: ComponentFixture<TransactionsFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionsFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
