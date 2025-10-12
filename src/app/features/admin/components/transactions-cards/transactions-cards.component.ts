import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-transactions-cards',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './transactions-cards.component.html',
  styleUrl: './transactions-cards.component.scss',
})
export class TransactionsCardsComponent {
  @Input() transactionsData: any[] = [];

  get allTransactionCount(): number {
    return this.transactionsData.length;
  }

  get inTransactionCount(): number {
    return this.transactionsData.filter((transaction) => transaction.type === 0)
      .length;
  }

  get outTransactionCount(): number {
    return this.transactionsData.filter((transaction) => transaction.type === 1)
      .length;
  }
}
