import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from '../../layout/dashboard-layout/dashboard-layout.component';
import { AuthGuard } from '../../core/guards/auth.guard';
// import { DashboardLayoutComponent } from '../../presentation/shared/layouts/dashboard-layout/dashboard-layout.component';

export const AUDITOR_ROUTES: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    // يمكن إضافة حماية إذا تريد
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            '../auditor/pages/auditor-dashboard-page/auditor-dashboard-page.component'
          ).then((m) => m.AuditorDashboardPageComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import(
            '../admin/pages/user-management/user-details/user-details.component'
          ).then((m) => m.UserDetailsComponent),
      },

      {
        path: 'edit-profile',
        loadComponent: () =>
          import('../../shared/pages/profile-page/profile-page.component').then(
            (m) => m.ProfilePageComponent
          ),
      },
      {
        path: 'section',
        loadComponent: () =>
          import(
            '../admin/pages/work-location/section-management/section-management.component'
          ).then((m) => m.SectionManagementComponent),
      },
      {
        path: 'section-details/:id',
        loadComponent: () =>
          import(
            '../admin/pages/work-location/section-management/section-details/section-details.component'
          ).then((m) => m.SectionDetailsComponent),
      },
    ],
  },
];
