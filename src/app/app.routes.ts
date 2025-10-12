import { Routes } from '@angular/router';
import { Roles } from './core/models/roles.enum';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'public', pathMatch: 'full' },

  // راوت عامة بدون حماية
  {
    path: 'public',
    loadChildren: () =>
      import('./features/auth/public.routes').then((m) => m.PUBLIC_ROUTES),
  },

  // راوتات محمية بـ lazy loading مع أدوار مختلفة
  {
    path: 'admin',
    canActivate: [AuthGuard],
    data: { roles: [Roles.Admin] },
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },

  {
    path: 'manager',
    canActivate: [AuthGuard],
    data: { roles: [Roles.Manager] },
    loadChildren: () =>
      import('./features/manager/manager.routes').then((m) => m.MANAGER_ROUTES),
  },

  {
    path: 'supervisor',
    canActivate: [AuthGuard],
    data: { roles: [Roles.Supervisor] },
    loadChildren: () =>
      import('./features/supervisor/supervisor.routes').then(
        (m) => m.SUPERVISOR_ROUTES
      ),
  },

  {
    path: 'cleaner',
    canActivate: [AuthGuard],
    data: { roles: [Roles.Cleaner] },
    loadChildren: () =>
      import('./features/cleaner/cleaner.routes').then((m) => m.CLEANER_ROUTES),
  },

  {
    path: 'auditor',
    canActivate: [AuthGuard],
    data: { roles: [Roles.Auditor] },
    loadChildren: () =>
      import('./features/auditor/auditor.routes').then((m) => m.AUDITOR_ROUTES),
  },

  // صفحة 404 أو Not Found
  {
    path: '**',
    loadComponent: () =>
      import('./features/auth/pages/notFound/notfound.component').then(
        (m) => m.NotfoundComponent
      ),
  },
];
