import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-applly-btn',
  standalone: true,
  template: `
    <button
      type="button"
      class="login-button"
      [disabled]="disabled"
      (click)="handleClick()"
    >
      @if(!loading;){
      <ng-container>
        {{ label }}
      </ng-container>
      }@else {
      <ng-container>
        {{ label }}
      </ng-container>
      }

      <ng-template #spinnerTpl>
        <span class="spinner"></span>
      </ng-template>
    </button>
  `,
  styles: [
    `
      .login-button {
        background-color: #025d8d;
        width: 80%;
        display: block;
        margin: 0 auto 60px auto;
        padding: 0.8rem;
        font-size: 1rem;
        font-weight: 700;
        color: #ffffff;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease;
      }
      .login-button:hover:not(:disabled) {
        background-color: #2a5ec7;
      }
      .login-button:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }
      .spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid transparent;
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        vertical-align: middle;
      }
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class AppllyBtnComponent {
  @Input() label = 'Submit';
  @Input() loading = false;
  @Input() disabled = false;
  @Output() clicked = new EventEmitter<void>();

  handleClick() {
    if (!this.disabled && !this.loading) {
      this.clicked.emit();
    }
  }
}
