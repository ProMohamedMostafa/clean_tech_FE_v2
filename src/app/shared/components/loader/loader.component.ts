// loader.component.ts
import { Component } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { LoaderService } from '../../../core/services/loader.service';

@Component({
  selector: 'app-loader',
  imports: [CommonModule, AsyncPipe],
  template: `
    @if (isLoading$ | async) {
    <div class="loader-overlay">
      <img
        src="../assets/clean-tech-loader.png"
        alt="Loading..."
        class="loader-image"
      />
    </div>
    }
  `,
  styles: [
    `
      .loader-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(255, 255, 255, 0.9);
        z-index: 9999;
      }

      .loader-image {
        width: 150px; /* Must be equal to height for perfect circle */
        height: 150px; /* Must be equal to width for perfect circle */
        border-radius: 50%; /* This makes it circular */
        object-fit: cover; /* Ensures image fills the circle without stretching */
        animation: spin 2s linear infinite;
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
export class LoaderComponent {
  isLoading$;

  constructor(private loaderService: LoaderService) {
    this.isLoading$ = this.loaderService.isLoading$;
  }
}
