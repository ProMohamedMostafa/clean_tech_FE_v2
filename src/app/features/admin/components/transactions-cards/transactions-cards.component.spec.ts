import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionsCardsComponent } from './transactions-cards.component';

describe('TransactionsCardsComponent', () => {
  let component: TransactionsCardsComponent;
  let fixture: ComponentFixture<TransactionsCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionsCardsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionsCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
