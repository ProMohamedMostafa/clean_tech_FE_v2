import { Routes } from '@angular/router';
import { PublicLayoutComponent } from '../../layout/public-layout/public-layout.component';
import { LoginComponent } from './pages/login/login.component';
import { ForgetPasswordComponent } from './pages/forget-password/forget-password.component';
import { VerifyCodeComponent } from './pages/verify-code/verify-code.component';
import { SetAPasswordComponent } from './pages/set-a-password/set-a-password.component';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' }, // إضافة redirect هنا

      { path: 'login', component: LoginComponent },
      { path: 'forget-password', component: ForgetPasswordComponent },
      { path: 'verify-code', component: VerifyCodeComponent },
      { path: 'set-password', component: SetAPasswordComponent },
    ],
  },
];
