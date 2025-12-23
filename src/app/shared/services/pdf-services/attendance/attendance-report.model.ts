    export interface AttendanceHistoryItem {
    id: string;
    userId: string;
    userName: string;
    role: string;
    date: string;
    clockIn: string;
    clockOut: string;
    duration: string;
    status: string;
    shiftName: string;
    }

    export interface TaskStatusData {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    notResolved: number;
    }

    export interface TaskPriorityData {
    total: number;
    low: number;
    medium: number;
    high: number;
    }
