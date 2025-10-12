import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from '../../layout/dashboard-layout/dashboard-layout.component';
import { AuthGuard } from '../../core/guards/auth.guard';
// import { DashboardLayoutComponent } from '../../presentation/shared/layouts/dashboard-layout/dashboard-layout.component';

export const MANAGER_ROUTES: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    // يمكن إضافة حماية إذا تريد
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/manager-dashboard/manager-dashboard.component').then(
            (m) => m.ManagerDashboardComponent
          ),
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
        path: 'user-management',
        loadComponent: () =>
          import(
            '../admin/pages/user-management/user-management.component'
          ).then((m) => m.UserManagementComponent),
      },
      {
        path: 'edit-user/:id',
        loadComponent: () =>
          import(
            '../admin/pages/user-management/user-form/user-form.component'
          ).then((m) => m.UserFormComponent),
        data: { mode: 'edit-user' }, // Explicit mode for admin editing user
      },
      {
        path: 'user-details/:id',
        loadComponent: () =>
          import(
            '../admin/pages/user-management/user-details/user-details.component'
          ).then((m) => m.UserDetailsComponent),
      },

      {
        path: 'shift',
        loadComponent: () =>
          import(
            '../admin/pages/shift-management/shift-management.component'
          ).then((m) => m.ShiftManagementComponent),
      },

      {
        path: 'shift-details/:id',
        loadComponent: () =>
          import(
            '../admin/pages/shift-management/shift-details/shift-details.component'
          ).then((m) => m.ShiftDetailsComponent),
      },
      {
        path: 'shift-calendar',
        loadComponent: () =>
          import(
            '../admin/pages/shift-management/shift-calendar/shift-calendar.component'
          ).then((m) => m.ShiftCalendarComponent),
      },
      {
        path: 'attendance/history',
        loadComponent: () =>
          import(
            '../admin/pages/attendance-management/attendance-management.component'
          ).then((m) => m.AttendanceManagementComponent),
      },
      {
        path: 'leave',
        loadComponent: () =>
          import(
            '../admin/pages/leaves-management/leaves-management.component'
          ).then((m) => m.LeavesManagementComponent),
      },
      {
        path: 'leave-details/:id',
        loadComponent: () =>
          import(
            '../admin/pages/leaves-management/leave-details/leave-details.component'
          ).then((m) => m.LeaveDetailsComponent),
      },
      {
        path: 'request-leave',
        loadComponent: () =>
          import(
            '../admin/pages/leaves-management/leaves-request/leaves-request.component'
          ).then((m) => m.LeavesRequestComponent),
      },
      {
        path: 'my-tasks',
        loadComponent: () =>
          import(
            '../admin/pages/task-management/task-management.component'
          ).then((m) => m.TaskManagementComponent),
      },
      {
        path: 'received-tasks',
        loadComponent: () =>
          import(
            '../admin/pages/task-management/task-management.component'
          ).then((m) => m.TaskManagementComponent),
      },
      {
        path: 'team-tasks',
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
        path: 'add-task',
        loadComponent: () =>
          import(
            '../admin/pages/task-management/task-form/task-form.component'
          ).then((m) => m.TaskFormComponent),
      },
      {
        path: 'edit-task/:id',
        loadComponent: () =>
          import(
            '../admin/pages/task-management/task-form/task-form.component'
          ).then((m) => m.TaskFormComponent),
      },

            {
        path: 'deleted-tasks',
        loadComponent: () =>
          import(
            '../admin/pages/task-management/deleted-tasks/deleted-tasks.component'
          ).then((m) => m.DeletedTasksComponent),
      },

      {
        path: 'area',
        loadComponent: () =>
          import(
            '../admin/pages/work-location/area-management/area-management.component'
          ).then((m) => m.AreaManagementComponent),
      },

      {
        path: 'area-details/:id',
        loadComponent: () =>
          import(
            '../admin/pages/work-location/area-management/area-details/area-details.component'
          ).then((m) => m.AreaDetailsComponent),
      },
      {
        path: 'city',
        loadComponent: () =>
          import(
            '../admin/pages/work-location/city-management/city-management.component'
          ).then((m) => m.CityManagementComponent),
      },

      {
        path: 'city-details/:id',
        loadComponent: () =>
          import(
            '../admin/pages/work-location/city-management/city-details/city-details.component'
          ).then((m) => m.CityDetailsComponent),
      },
      {
        path: 'organization',
        loadComponent: () =>
          import(
            '../admin/pages/work-location/organization-management/organization-management.component'
          ).then((m) => m.OrganizationManagementComponent),
      },
      {
        path: 'organization-details/:id',
        loadComponent: () =>
          import(
            '../admin/pages/work-location/organization-management/organization-details/organization-details.component'
          ).then((m) => m.OrganizationDetailsComponent),
      },
      {
        path: 'building',
        loadComponent: () =>
          import(
            '../admin/pages/work-location/building-management/building-management.component'
          ).then((m) => m.BuildingManagementComponent),
      },

      {
        path: 'building-details/:id',
        loadComponent: () =>
          import(
            '../admin/pages/work-location/building-management/building-details/building-details.component'
          ).then((m) => m.BuildingDetailsComponent),
      },

      {
        path: 'floor',
        loadComponent: () =>
          import(
            '../admin/pages/work-location/floor-management/floor-management.component'
          ).then((m) => m.FloorManagementComponent),
      },

      {
        path: 'floor-details/:id',
        loadComponent: () =>
          import(
            '../admin/pages/work-location/floor-management/floor-details/floor-details.component'
          ).then((m) => m.FloorDetailsComponent),
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

      {
        path: 'point',
        loadComponent: () =>
          import(
            '../admin/pages/work-location/point-management/point-management.component'
          ).then((m) => m.PointManagementComponent),
      },

      {
        path: 'point-details/:id',
        loadComponent: () =>
          import(
            '../admin/pages/work-location/point-management/point-details/point-details.component'
          ).then((m) => m.PointDetailsComponent),
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
