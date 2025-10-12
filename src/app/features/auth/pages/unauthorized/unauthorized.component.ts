// src/app/presentation/pages/unauthorized/unauthorized.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-unauthorized',
  template: `
    <div style="text-align:center; margin-top: 50px;">
      <h1>🚫 Unauthorized</h1>
      <p>You don't have permission to access this page.</p>
      <a routerLink="/public/login">Return to login</a>
    </div>
  `,
})
export class UnauthorizedComponent {}
