import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { Role } from '../../features/auth/models/auth.model';
import { getUserLocation } from '../helpers/auth.helpers';
import { UserService } from '../../features/admin/services/user.service';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private authzBaseUrl = environment.apiUrl + '/authorization';

  constructor(
    private http: HttpClient,
    private translate: TranslateService,
    private userService: UserService // Inject UserManagementService
  ) {}

  // Fetch roles from API
  getRoles(): Observable<Role[]> {
    return this.http
      .get<{
        statusCode: number;
        meta: any | null;
        succeeded: boolean;
        message: string;
        error: any | null;
        businessErrorCode: any | null;
        data: Role[];
      }>(`${this.authzBaseUrl}/roles`)
      .pipe(
        // Extract only the data array for easier usage downstream
        map((response) => response.data)
      );
  }

  getUsersByRoleId(roleId: number): Observable<any> {
    return this.userService.getUsersWithPagination({
      RoleId: roleId,
    });
  }

  private menus: {
    [key: string]: {
      label: string;
      route?: string; // Make 'route' optional
      icon: string;
      children?: any[];
    }[];
  } = {
    Admin: [
      {
        label: 'sidebar.DASHBOARD',
        route: '/admin',
        icon: 'fas fa-tachometer-alt',
      },
      {
        label: 'sidebar.PROVIDER',
        route: '/admin/provider-management',
        icon: 'fas fa-briefcase',
      },
      {
        label: 'sidebar.USER_MANAGEMENT',
        route: '/admin/user-management',
        icon: 'fa-solid fa-users-gear',
      },
      {
        label: 'sidebar.WORK_LOCATION',
        icon: 'fas fa-map-marker-alt',
        children: [
          { label: 'sidebar.AREA', route: '/admin/area', icon: 'fas fa-map' },
          { label: 'sidebar.CITY', route: '/admin/city', icon: 'fas fa-city' },
          {
            label: 'sidebar.ORGANIZATION',
            route: '/admin/organization',
            icon: 'fas fa-building',
          },
          {
            label: 'sidebar.BUILDING',
            route: '/admin/building',
            icon: 'fas fa-building',
          },
          {
            label: 'sidebar.FLOOR',
            route: '/admin/floor',
            icon: 'fas fa-layer-group',
          },
          {
            label: 'sidebar.SECTION',
            route: '/admin/section',
            icon: 'fas fa-cogs',
          },
          {
            label: 'sidebar.POINT',
            route: '/admin/point',
            icon: 'fas fa-map-pin',
          },
        ],
      },
      {
        label: 'sidebar.ASSIGNMENT_MANAGEMENT',
        icon: 'fas fa-tasks',
        children: [
          {
            label: 'sidebar.ASSIGNMENT',
            route: '/admin/assign',
            icon: 'fas fa-clipboard-check',
          },
          {
            label: 'sidebar.SHIFT_ASSIGN',
            route: '/admin/assign-shift',
            icon: 'fas fa-calendar-check',
          },
        ],
      },
      {
        label: 'sidebar.SHIFT_MANAGEMENT',
        icon: 'fas fa-clock',
        children: [
          {
            label: 'sidebar.VIEW_SHIFTS',
            route: '/admin/shift',
            icon: 'fas fa-calendar-day',
          },
          {
            label: 'sidebar.SHIFT_CALENDAR',
            route: '/admin/shift-calendar',
            icon: 'fas fa-calendar-week',
          },
        ],
      },
      {
        label: 'sidebar.ATTENDANCE',
        icon: 'fas fa-calendar-check',
        children: [
          {
            label: 'sidebar.HISTORY',
            route: '/admin/attendance/history',
            icon: 'fas fa-history',
          },
        ],
      },
      {
        label: 'sidebar.LEAVES',
        icon: 'fas fa-calendar-check',
        children: [
          {
            label: 'sidebar.LEAVES',
            route: '/admin/leave',
            icon: 'fas fa-suitcase',
          },
          {
            label: 'sidebar.REQUEST_LEAVES',
            route: '/admin/request-leave',
            icon: 'fas fa-suitcase',
          },
        ],
      },
      {
        label: 'sidebar.TASKS',
        icon: 'fa-solid fa-list-check',
        children: [
          {
            label: 'sidebar.TASKS',
            route: '/admin/tasks',
            icon: 'fa-solid fa-list-check',
          },
          {
            label: 'sidebar.TASK_CALENDAR',
            route: '/admin/task-calendar',
            icon: 'fa-solid fa-calendar-days',
          },
        ],
      },
      {
        label: 'sidebar.STOCK_MANAGEMENT',
        icon: 'fas fa-cogs',
        children: [
          {
            label: 'sidebar.CATEGORY',
            route: '/admin/category',
            icon: 'fas fa-boxes',
          },
          {
            label: 'sidebar.MATERIAL',
            route: '/admin/material',
            icon: 'fas fa-cogs',
          },
          {
            label: 'sidebar.TRANSACTIONS',
            route: '/admin/transaction',
            icon: 'fas fa-exchange-alt',
          },
        ],
      },
      {
        label: 'sidebar.SENSOR',
        route: '/admin/sensor',
        icon: 'fas fa-history',
      },
      {
        label: 'sidebar.RECENT_ACTIVITIES',
        route: '/admin/recent-activities',
        icon: 'fas fa-history',
      },
      {
        label: 'sidebar.FEEDBACK_MANAGER',
        icon: 'fas fa-comments',
        children: [
          {
            label: 'sidebar.FEEDBACK_HOME',
            route: '/admin/feedback-home',
            icon: 'fas fa-home',
          },
          {
            label: 'sidebar.QUESTION_BANK',
            route: '/admin/questions',
            icon: 'fas fa-question-circle',
          },
          {
            label: 'sidebar.FEEDBACK',
            route: '/admin/feedback',
            icon: 'fas fa-comment-dots',
          },
          {
            label: 'sidebar.DEVICES',
            route: '/admin/devices',
            icon: 'fas fa-desktop',
          },
        ],
      },
    ],

    Manager: [
      {
        label: 'sidebar.DASHBOARD',
        route: '/manager',
        icon: 'fas fa-chart-line',
      },
      {
        label: 'sidebar.USER_MANAGEMENT',
        route: '/manager/user-management',
        icon: 'fas fa-users-cog',
      },
      {
        label: 'sidebar.SHIFT_MANAGEMENT',
        icon: 'fas fa-tasks',
        children: [
          {
            label: 'sidebar.VIEW_SHIFTS',
            route: '/manager/shift',
            icon: 'fas fa-map-pin',
          },
          {
            label: 'sidebar.SHIFT_CALENDAR',
            route: '/manager/shift-calendar',
            icon: 'fas fa-map-pin',
          },
        ],
      },
      {
        label: 'sidebar.WORK_LOCATION',
        icon: 'fas fa-map-marker-alt',
        children: [
          {
            label: 'sidebar.AREA',
            route: '/manager/area',
            icon: 'fas fa-map-marker-alt',
          },
          {
            label: 'sidebar.CITY',
            route: '/manager/city',
            icon: 'fas fa-city',
          },
          {
            label: 'sidebar.ORGANIZATION',
            route: '/manager/organization',
            icon: 'fas fa-building',
          },
          {
            label: 'sidebar.BUILDING',
            route: '/manager/building',
            icon: 'fas fa-building',
          },
          {
            label: 'sidebar.FLOOR',
            route: '/manager/floor',
            icon: 'fas fa-layer-group',
          },
          {
            label: 'sidebar.SECTION',
            route: '/manager/section',
            icon: 'fas fa-layer-group',
          },
          {
            label: 'sidebar.POINT',
            route: '/manager/point',
            icon: 'fas fa-map-pin',
          },
        ],
      },
      {
        label: 'sidebar.ATTENDANCE',
        icon: 'fas fa-calendar-check',
        children: [
          {
            label: 'sidebar.HISTORY',
            route: '/manager/attendance/history',
            icon: 'fas fa-history',
          },
        ],
      },
      {
        label: 'sidebar.LEAVES',
        icon: 'fas fa-calendar-check',
        children: [
          {
            label: 'sidebar.LEAVES',
            route: '/manager/leave',
            icon: 'fas fa-suitcase',
          },
          {
            label: 'sidebar.REQUEST_LEAVES',
            route: '/manager/request-leave',
            icon: 'fas fa-suitcase',
          },
        ],
      },
      {
        label: 'sidebar.TASKS',
        icon: 'fas fa-tasks',
        children: [
          {
            label: 'sidebar.MY_TASKS',
            route: '/manager/my-tasks',
            icon: 'fas fa-tasks',
          },
          {
            label: 'sidebar.RECEIVED_TASKS',
            route: '/manager/received-tasks',
            icon: 'fas fa-tasks',
          },
          {
            label: 'sidebar.TEAM_TASKS',
            route: '/manager/team-tasks',
            icon: 'fas fa-tasks',
          },
        ],
      },
      {
        label: 'sidebar.RECENT_ACTIVITIES',
        route: '/manager/recent-activities',
        icon: 'fas fa-map-pin',
      },
    ],

    Supervisor: [
      {
        label: 'sidebar.DASHBOARD',
        route: '/supervisor',
        icon: 'fas fa-chart-line',
      },
      {
        label: 'sidebar.USER_MANAGEMENT',
        route: '/supervisor/user-management',
        icon: 'fas fa-users-cog',
      },
      {
        label: 'sidebar.SHIFT_MANAGEMENT',
        icon: 'fas fa-tasks',
        children: [
          {
            label: 'sidebar.VIEW_SHIFTS',
            route: '/supervisor/shift',
            icon: 'fas fa-map-pin',
          },
          {
            label: 'sidebar.SHIFT_CALENDAR',
            route: '/supervisor/shift-calendar',
            icon: 'fas fa-map-pin',
          },
        ],
      },
      {
        label: 'sidebar.WORK_LOCATION',
        icon: 'fas fa-map-marker-alt',
        children: [
          {
            label: 'sidebar.AREA',
            route: '/supervisor/area',
            icon: 'fas fa-map-marker-alt',
          },
          {
            label: 'sidebar.CITY',
            route: '/supervisor/city',
            icon: 'fas fa-city',
          },
          {
            label: 'sidebar.ORGANIZATION',
            route: '/supervisor/organization',
            icon: 'fas fa-building',
          },
          {
            label: 'sidebar.BUILDING',
            route: '/supervisor/building',
            icon: 'fas fa-building',
          },
          {
            label: 'sidebar.FLOOR',
            route: '/supervisor/floor',
            icon: 'fas fa-layer-group',
          },
          {
            label: 'sidebar.SECTION',
            route: '/supervisor/section',
            icon: 'fas fa-layer-group',
          },
          {
            label: 'sidebar.POINT',
            route: '/supervisor/point',
            icon: 'fas fa-map-pin',
          },
        ],
      },
      {
        label: 'sidebar.ATTENDANCE',
        icon: 'fas fa-calendar-check',
        children: [
          {
            label: 'sidebar.HISTORY',
            route: '/supervisor/attendance/history',
            icon: 'fas fa-history',
          },
        ],
      },
      {
        label: 'sidebar.LEAVES',
        icon: 'fas fa-calendar-check',
        children: [
          {
            label: 'sidebar.LEAVES',
            route: '/supervisor/leave',
            icon: 'fas fa-suitcase',
          },
          {
            label: 'sidebar.REQUEST_LEAVES',
            route: '/supervisor/request-leave',
            icon: 'fas fa-suitcase',
          },
        ],
      },
      {
        label: 'sidebar.TASKS',
        icon: 'fas fa-tasks',
        children: [
          {
            label: 'sidebar.MY_TASKS',
            route: '/supervisor/my-tasks',
            icon: 'fas fa-tasks',
          },
          {
            label: 'sidebar.RECEIVED_TASKS',
            route: '/supervisor/received-tasks',
            icon: 'fas fa-tasks',
          },
          {
            label: 'sidebar.TEAM_TASKS',
            route: '/supervisor/team-tasks',
            icon: 'fas fa-tasks',
          },
        ],
      },
      {
        label: 'sidebar.RECENT_ACTIVITIES',
        route: '/supervisor/recent-activities',
        icon: 'fas fa-map-pin',
      },
    ],

    Cleaner: [
      {
        label: 'sidebar.DASHBOARD',
        route: '/cleaner',
        icon: 'fas fa-chart-line',
      },
      {
        label: 'sidebar.LEAVES',
        icon: 'fas fa-calendar-check',
        children: [
          {
            label: 'sidebar.REQUEST_LEAVES',
            route: '/cleaner/request-leave',
            icon: 'fas fa-suitcase',
          },
        ],
      },
      {
        label: 'sidebar.MY_TASKS',
        route: '/cleaner/received-tasks',
        icon: 'fas fa-tasks',
      },
      {
        label: 'sidebar.RECENT_ACTIVITIES',
        route: '/cleaner/recent-activities',
        icon: 'fas fa-map-pin',
      },
    ],

    Auditor: [
      {
        label: 'sidebar.DASHBOARD',
        route: '/auditor',
        icon: 'fas fa-tachometer-alt',
      },
      {
        label: 'sidebar.SECTION',
        route: '/auditor/section',
        icon: 'fas fa-layer-group',
      },
    ],
  };

  // Get filtered menu based on location
  getFilteredMenu(): Observable<any[]> {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return of([]);
    }

    try {
      const user = JSON.parse(userStr);
      const userRole = user.role || null;
      const userLocation = getUserLocation() || null;

      if (!userRole || !this.menus[userRole]) {
        return of([]);
      }

      const menu = this.menus[userRole];
      const locationLevels = ['A', 'C', 'O', 'B', 'F', 'S', 'P'];
      const userLocationIndex = userLocation
        ? locationLevels.indexOf(userLocation)
        : -1;

      // Filter WORK_LOCATION only if not Admin
      const filteredMenu = menu
        .filter((item) => {
          if (
            item.label === 'WORK_LOCATION' &&
            userLocationIndex === -1 &&
            userRole !== 'Admin'
          ) {
            return false;
          }
          return true;
        })
        .map((item) => {
          if (
            item.label === 'WORK_LOCATION' &&
            item.children &&
            userLocationIndex !== -1 &&
            userRole !== 'Admin'
          ) {
            return {
              ...item,
              children: item.children.filter((child) => {
                const locationType = child.label.toUpperCase().charAt(0);
                const locationIndex = locationLevels.indexOf(locationType);
                return (
                  locationIndex !== -1 && locationIndex >= userLocationIndex
                );
              }),
            };
          }
          return item;
        });

      // Apply translations to all items including Admin
      return this.translate.get('PRIVATE_MENUS').pipe(
        map((translations: any) =>
          filteredMenu.map((item) => ({
            ...item,
            label: translations[item.label] || item.label,
            children: item.children?.map((child) => ({
              ...child,
              label: translations[child.label] || child.label,
            })),
          }))
        )
      );
    } catch (error) {
      console.error('Error parsing user data:', error);
      return of([]);
    }
  }

  // Get the role from AuthService
  getRole(): string | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      const user = JSON.parse(userStr);
      return user.role || null;
    } catch {
      return null;
    }
  }

  // Get the appropriate menu based on the user's role
  getMenu(): Observable<any[]> {
    const role = this.getRole();
    const roleMenus = role ? this.menus[role] || [] : [];

    return this.translate.get('PRIVATE_MENUS').pipe(
      map((translations: any) =>
        roleMenus.map((item) => ({
          ...item,
          label: translations[item.label] || item.label, // Translate the label
          children: item.children?.map((child) => ({
            ...child,
            label: translations[child.label] || child.label, // Translate child labels
          })),
        }))
      )
    );
  }
}
