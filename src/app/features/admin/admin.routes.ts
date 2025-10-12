import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from '../../layout/dashboard-layout/dashboard-layout.component';
import { AuthGuard } from '../../core/guards/auth.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],

    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/admin-dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import(
            './pages/user-management/user-details/user-details.component'
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
        path: 'provider-management',
        loadComponent: () =>
          import(
            './pages/provider-management/provider-management.component'
          ).then((m) => m.ProviderManagementComponent),
      },
      {
        path: 'deleted-providers',
        loadComponent: () =>
          import(
            './pages/provider-management/deleted-providers/deleted-providers.component'
          ).then((m) => m.DeletedProvidersComponent),
      },
      {
        path: 'user-management',
        loadComponent: () =>
          import('./pages/user-management/user-management.component').then(
            (m) => m.UserManagementComponent
          ),
      },
      {
        path: 'add-user',
        loadComponent: () =>
          import('./pages/user-management/user-form/user-form.component').then(
            (m) => m.UserFormComponent
          ),
        data: { mode: 'add' },
      },
      {
        path: 'edit-user/:id',
        loadComponent: () =>
          import('./pages/user-management/user-form/user-form.component').then(
            (m) => m.UserFormComponent
          ),
        data: { mode: 'edit-user' }, // Explicit mode for admin editing user
      },
      {
        path: 'user-details/:id',
        loadComponent: () =>
          import(
            './pages/user-management/user-details/user-details.component'
          ).then((m) => m.UserDetailsComponent),
      },

      {
        path: 'deleted-users',
        loadComponent: () =>
          import(
            './pages/user-management/deleted-users/deleted-users.component'
          ).then((m) => m.DeletedUsersComponent),
      },
      {
        path: 'area',
        loadComponent: () =>
          import(
            './pages/work-location/area-management/area-management.component'
          ).then((m) => m.AreaManagementComponent),
      },
      {
        path: 'deleted-areas',
        loadComponent: () =>
          import(
            './pages/work-location/area-management/deleted-areas/deleted-areas.component'
          ).then((m) => m.DeletedAreasComponent),
      },
      {
        path: 'add-area',
        loadComponent: () =>
          import(
            './pages/work-location/area-management/area-form/area-form.component'
          ).then((m) => m.AreaFormComponent),
        data: { mode: 'add' },
      },
      {
        path: 'edit-area/:id',
        loadComponent: () =>
          import(
            './pages/work-location/area-management/area-form/area-form.component'
          ).then((m) => m.AreaFormComponent),
        data: { mode: 'edit' },
      },
      {
        path: 'area-details/:id',
        loadComponent: () =>
          import(
            './pages/work-location/area-management/area-details/area-details.component'
          ).then((m) => m.AreaDetailsComponent),
      },
      {
        path: 'city',
        loadComponent: () =>
          import(
            './pages/work-location/city-management/city-management.component'
          ).then((m) => m.CityManagementComponent),
      },
      {
        path: 'deleted-cities',
        loadComponent: () =>
          import(
            './pages/work-location/city-management/deleted-cities/deleted-cities.component'
          ).then((m) => m.DeletedCitiesComponent),
      },
      {
        path: 'add-city',
        loadComponent: () =>
          import(
            './pages/work-location/city-management/city-form/city-form.component'
          ).then((m) => m.CityFormComponent),
        data: { mode: 'add' },
      },
      {
        path: 'edit-city/:id',
        loadComponent: () =>
          import(
            './pages/work-location/city-management/city-form/city-form.component'
          ).then((m) => m.CityFormComponent),
        data: { mode: 'edit' },
      },
      {
        path: 'city-details/:id',
        loadComponent: () =>
          import(
            './pages/work-location/city-management/city-details/city-details.component'
          ).then((m) => m.CityDetailsComponent),
      },
      {
        path: 'organization',
        loadComponent: () =>
          import(
            './pages/work-location/organization-management/organization-management.component'
          ).then((m) => m.OrganizationManagementComponent),
      },
      {
        path: 'deleted-organizations',
        loadComponent: () =>
          import(
            './pages/work-location/organization-management/deleted-organizations/deleted-organizations.component'
          ).then((m) => m.DeletedOrganizationsComponent),
      },
      {
        path: 'add-organization',
        loadComponent: () =>
          import(
            './pages/work-location/organization-management/organization-form/organization-form.component'
          ).then((m) => m.OrganizationFormComponent),
        data: { mode: 'add' },
      },
      {
        path: 'edit-organization/:id',
        loadComponent: () =>
          import(
            './pages/work-location/organization-management/organization-form/organization-form.component'
          ).then((m) => m.OrganizationFormComponent),
        data: { mode: 'edit' },
      },

      {
        path: 'organization-details/:id',
        loadComponent: () =>
          import(
            './pages/work-location/organization-management/organization-details/organization-details.component'
          ).then((m) => m.OrganizationDetailsComponent),
      },
      {
        path: 'building',
        loadComponent: () =>
          import(
            './pages/work-location/building-management/building-management.component'
          ).then((m) => m.BuildingManagementComponent),
      },
      {
        path: 'add-building',
        loadComponent: () =>
          import(
            './pages/work-location/building-management/building-form/building-form.component'
          ).then((m) => m.BuildingFormComponent),
        data: { mode: 'add' },
      },
      {
        path: 'edit-building/:id',
        loadComponent: () =>
          import(
            './pages/work-location/building-management/building-form/building-form.component'
          ).then((m) => m.BuildingFormComponent),
        data: { mode: 'edit' },
      },
      {
        path: 'building-details/:id',
        loadComponent: () =>
          import(
            './pages/work-location/building-management/building-details/building-details.component'
          ).then((m) => m.BuildingDetailsComponent),
      },
      {
        path: 'deleted-buildings',
        loadComponent: () =>
          import(
            './pages/work-location/building-management/deleted-buildings/deleted-buildings.component'
          ).then((m) => m.DeletedBuildingsComponent),
      },
      {
        path: 'floor',
        loadComponent: () =>
          import(
            './pages/work-location/floor-management/floor-management.component'
          ).then((m) => m.FloorManagementComponent),
      },

      {
        path: 'add-floor',
        loadComponent: () =>
          import(
            './pages/work-location/floor-management/floor-form/floor-form.component'
          ).then((m) => m.FloorFormComponent),
        data: { mode: 'add' },
      },
      {
        path: 'edit-floor/:id',
        loadComponent: () =>
          import(
            './pages/work-location/floor-management/floor-form/floor-form.component'
          ).then((m) => m.FloorFormComponent),
        data: { mode: 'edit' },
      },
      {
        path: 'floor-details/:id',
        loadComponent: () =>
          import(
            './pages/work-location/floor-management/floor-details/floor-details.component'
          ).then((m) => m.FloorDetailsComponent),
      },
      {
        path: 'deleted-floors',
        loadComponent: () =>
          import(
            './pages/work-location/floor-management/deleted-floors/deleted-floors.component'
          ).then((m) => m.DeletedFloorsComponent),
      },
      {
        path: 'point',
        loadComponent: () =>
          import(
            './pages/work-location/point-management/point-management.component'
          ).then((m) => m.PointManagementComponent),
      },
      {
        path: 'add-point',
        loadComponent: () =>
          import(
            './pages/work-location/point-management/point-form/point-form.component'
          ).then((m) => m.PointFormComponent),
        data: { mode: 'add' },
      },
      {
        path: 'edit-point/:id',
        loadComponent: () =>
          import(
            './pages/work-location/point-management/point-form/point-form.component'
          ).then((m) => m.PointFormComponent),
        data: { mode: 'edit' },
      },
      {
        path: 'point-details/:id',
        loadComponent: () =>
          import(
            './pages/work-location/point-management/point-details/point-details.component'
          ).then((m) => m.PointDetailsComponent),
      },
      {
        path: 'deleted-points',
        loadComponent: () =>
          import(
            './pages/work-location/point-management/deleted-points/deleted-points.component'
          ).then((m) => m.DeletedPointsComponent),
      },
      {
        path: 'section',
        loadComponent: () =>
          import(
            './pages/work-location/section-management/section-management.component'
          ).then((m) => m.SectionManagementComponent),
      },
      {
        path: 'add-section',
        loadComponent: () =>
          import(
            './pages/work-location/section-management/section-form/section-form.component'
          ).then((m) => m.SectionFormComponent),
        data: { mode: 'add' },
      },
      {
        path: 'edit-section/:id',
        loadComponent: () =>
          import(
            './pages/work-location/section-management/section-form/section-form.component'
          ).then((m) => m.SectionFormComponent),
        data: { mode: 'edit' },
      },
      {
        path: 'section-details/:id',
        loadComponent: () =>
          import(
            './pages/work-location/section-management/section-details/section-details.component'
          ).then((m) => m.SectionDetailsComponent),
      },
      {
        path: 'deleted-sections',
        loadComponent: () =>
          import(
            './pages/work-location/section-management/deleted-sections/deleted-sections.component'
          ).then((m) => m.DeletedSectionsComponent),
      },
      {
        path: 'assign',
        loadComponent: () =>
          import(
            './pages/user-location-assign/user-location-assign.component'
          ).then((m) => m.UserLocationAssignComponent),
      },

      {
        path: 'shift',
        loadComponent: () =>
          import('./pages/shift-management/shift-management.component').then(
            (m) => m.ShiftManagementComponent
          ),
      },
      {
        path: 'add-shift',
        loadComponent: () =>
          import(
            './pages/shift-management/shift-form/shift-form.component'
          ).then((m) => m.ShiftFormComponent),
        data: { title: 'Add Shift' },
      },
      {
        path: 'edit-shift/:id',
        loadComponent: () =>
          import(
            './pages/shift-management/shift-form/shift-form.component'
          ).then((m) => m.ShiftFormComponent),
        data: { title: 'Edit Shift' },
      },

      {
        path: 'assign-shift',
        loadComponent: () =>
          import(
            './pages/shift-management/shift-assign/shift-assign.component'
          ).then((m) => m.ShiftAssignComponent),
      },
      {
        path: 'shift-details/:id',
        loadComponent: () =>
          import(
            './pages/shift-management/shift-details/shift-details.component'
          ).then((m) => m.ShiftDetailsComponent),
      },
      {
        path: 'shift-calendar',
        loadComponent: () =>
          import(
            './pages/shift-management/shift-calendar/shift-calendar.component'
          ).then((m) => m.ShiftCalendarComponent),
      },
      {
        path: 'deleted-shifts',
        loadComponent: () =>
          import(
            './pages/shift-management/deleted-shifts/deleted-shifts.component'
          ).then((m) => m.DeletedShiftsComponent),
      },
      {
        path: 'attendance/history',
        loadComponent: () =>
          import(
            './pages/attendance-management/attendance-management.component'
          ).then((m) => m.AttendanceManagementComponent),
      },
      {
        path: 'leave',
        loadComponent: () =>
          import('./pages/leaves-management/leaves-management.component').then(
            (m) => m.LeavesManagementComponent
          ),
      },
      {
        path: 'deleted-leaves',
        loadComponent: () =>
          import(
            './pages/leaves-management/deleted-leaves/deleted-leaves.component'
          ).then((m) => m.DeletedLeavesComponent),
      },
      {
        path: 'leave-details/:id',
        loadComponent: () =>
          import(
            './pages/leaves-management/leave-details/leave-details.component'
          ).then((m) => m.LeaveDetailsComponent),
      },
      {
        path: 'request-leave',
        loadComponent: () =>
          import(
            './pages/leaves-management/leaves-request/leaves-request.component'
          ).then((m) => m.LeavesRequestComponent),
      },
      {
        path: 'tasks',
        loadComponent: () =>
          import('./pages/task-management/task-management.component').then(
            (m) => m.TaskManagementComponent
          ),
      },
      {
        path: 'task-details/:id',
        loadComponent: () =>
          import(
            './pages/task-management/task-details/task-details.component'
          ).then((m) => m.TaskDetailsComponent),
      },
      {
        path: 'add-task',
        loadComponent: () =>
          import('./pages/task-management/task-form/task-form.component').then(
            (m) => m.TaskFormComponent
          ),
      },
      {
        path: 'edit-task/:id',
        loadComponent: () =>
          import('./pages/task-management/task-form/task-form.component').then(
            (m) => m.TaskFormComponent
          ),
      },
      {
        path: 'deleted-tasks',
        loadComponent: () =>
          import(
            './pages/task-management/deleted-tasks/deleted-tasks.component'
          ).then((m) => m.DeletedTasksComponent),
      },
      {
        path: 'task-calendar',
        loadComponent: () =>
          import(
            './pages/task-management/task-calendar/task-calendar.component'
          ).then((m) => m.TaskCalendarComponent),
      },
      {
        path: 'category',
        loadComponent: () =>
          import(
            './pages/stock-management/category-management/category-management.component'
          ).then((m) => m.CategoryManagementComponent),
      },
      {
        path: 'deleted-categories',
        loadComponent: () =>
          import(
            './pages/stock-management/category-management/deleted-categories/deleted-categories.component'
          ).then((m) => m.DeletedCategoriesComponent),
      },
      {
        path: 'material',
        loadComponent: () =>
          import(
            './pages/stock-management/material-management/material-management.component'
          ).then((m) => m.MaterialManagementComponent),
      },
      {
        path: 'material-details/:id',
        loadComponent: () =>
          import(
            './pages/stock-management/material-management/material-details/material-details.component'
          ).then((m) => m.MaterialDetailsComponent),
      },
      {
        path: 'deleted-material',
        loadComponent: () =>
          import(
            './pages/stock-management/material-management/deleted-materials/deleted-materials.component'
          ).then((m) => m.DeletedMaterialsComponent),
      },
      {
        path: 'transaction',
        loadComponent: () =>
          import(
            './pages/stock-management/transactions-management/transactions-management.component'
          ).then((m) => m.TransactionsManagementComponent),
      },

      {
        path: 'sensor',
        loadComponent: () =>
          import('./pages/sensor-management/sensor-management.component').then(
            (m) => m.SensorManagementComponent
          ),
      },
      {
        path: 'deleted-sensors',
        loadComponent: () =>
          import(
            './pages/sensor-management/deleted-sensors/deleted-sensors.component'
          ).then((m) => m.DeletedSensorsComponent),
      },
      {
        path: 'sensor-details/:id',
        loadComponent: () =>
          import(
            './pages/sensor-management/sensor-details/sensor-details.component'
          ).then((m) => m.SensorDetailsComponent),
      },
      {
        path: 'recent-activities',
        loadComponent: () =>
          import('./pages/recent-activity/recent-activity.component').then(
            (m) => m.RecentActivityComponent
          ),
      },
      {
        path: 'questions',
        loadComponent: () =>
          import(
            './pages/feedback-management/question-module/question-management.component'
          ).then((m) => m.QuestionManagementComponent),
      },
      {
        path: 'feedback',
        loadComponent: () =>
          import(
            './pages/feedback-management/feedback-module/feedback-module.component'
          ).then((m) => m.FeedbackModuleComponent),
      },
      {
        path: 'feedback-home',
        loadComponent: () =>
          import(
            './pages/feedback-management/feedback-home-page/feedback-home-page.component'
          ).then((m) => m.FeedbackHomePageComponent),
      },
      {
        path: 'feedback/:id',
        loadComponent: () =>
          import(
            './pages/feedback-management/feedback-module/feedback-details/feedback-details.component'
          ).then((m) => m.FeedbackDetailsComponent),
      },
      {
        path: 'devices',
        loadComponent: () =>
          import(
            './pages/feedback-management/device-management/device-management.component'
          ).then((m) => m.DeviceManagementComponent),
      },
      {
        path: 'device-details/:id',
        loadComponent: () =>
          import(
            './pages/feedback-management/device-management/device-details/device-details.component'
          ).then((m) => m.DeviceDetailsComponent),
      },
    ],
  },
];
