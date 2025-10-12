import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from '../../layout/dashboard-layout/dashboard-layout.component';
import { AuthGuard } from '../../core/guards/auth.guard';
// import { DashboardLayoutComponent } from '../../presentation/shared/layouts/dashboard-layout/dashboard-layout.component';
// import { CleanerTaskComponent } from '../../presentation/pages/cleaner/cleaner-task/cleaner-task.component';
// import { TaskDetailsComponent } from '../../presentation/components/cleaner-route/task-management/task-details/task-details.component';
// import { CleanerDashboardComponent } from '../../presentation/pages/cleaner/cleaner-dashboard/cleaner-dashboard.component';
// import { CleanerProfilePageComponent } from '../../presentation/pages/cleaner/profile-page/profile-page.component';

export const CLEANER_ROUTES: Routes = [
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
            '../manager/pages/manager-dashboard/manager-dashboard.component'
          ).then((m) => m.ManagerDashboardComponent),
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
        path: 'request-leave',
        loadComponent: () =>
          import(
            '../admin/pages/leaves-management/leaves-request/leaves-request.component'
          ).then((m) => m.LeavesRequestComponent),
      },
       {
        path: 'leave-details/:id',
        loadComponent: () =>
          import(
            '../admin/pages/leaves-management/leave-details/leave-details.component'
          ).then((m) => m.LeaveDetailsComponent),
      },
      {
        path: 'received-tasks',
        loadComponent: () =>
          import(
            '../admin/pages/task-management/task-management.component'
          ).then((m) => m.TaskManagementComponent),
      },
      {
        path: 'task-details/:id',
        loadComponent: () =>
          import(
            '../admin/pages/task-management/task-details/task-details.component'
          ).then((m) => m.TaskDetailsComponent),
      },
      {
        path: 'recent-activities',
        loadComponent: () =>
          import(
            '../admin/pages/recent-activity/recent-activity.component'
          ).then((m) => m.RecentActivityComponent),
      },
    ],
  },
  // {
  //   path: '',
  //   component: DashboardLayoutComponent,

  // },
];
