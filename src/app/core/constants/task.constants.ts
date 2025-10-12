export const TASK_STATUS: { [key: string]: number } = {
  Pending: 0,
  InProgress: 1,
  WaitingForApproval: 2,
  Completed: 3,
  Rejected: 4,
  NotResolved: 5,
  Overdue: 6,
};

export const TASK_PRIORITY: { [key: string]: number } = {
  Low: 0,
  Medium: 1,
  High: 2,
};

// task-view-types.ts
export enum TaskViewType {
  ALL_TASKS = 'tasks',
  MY_TASKS = 'my-tasks',
  RECEIVED_TASKS = 'received-tasks',
  TEAM_TASKS = 'team-tasks',
}

export interface TaskViewConfig {
  title: string;
  apiMethod: string;
  availableActions: string[];
}
