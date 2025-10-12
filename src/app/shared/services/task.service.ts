import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  TaskCompletionData,
  TaskModel,
  TaskPaginationData,
  TaskPaginationFilters,
  TaskPriorityData,
  TaskStatusData,
} from '../models/task.model';
import { TaskRepository } from '../repository/task.repository';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(private taskRepo: TaskRepository) {}

  /**
   * Fetch paginated list of tasks applying given filters.
   * @param filters Filter criteria for pagination and search
   * @returns Observable emitting paginated task data
   */
  getTasks(filters: TaskPaginationFilters): Observable<TaskPaginationData> {
    return this.taskRepo
      .getPaginatedTasks(filters)
      .pipe(map((response) => response.data));
  }

  /**
   * Get user's tasks with filters
   * @param filters Task filters object
   * @returns Observable with paginated task data
   */
  getMyTasks(filters: TaskPaginationFilters): Observable<TaskPaginationData> {
    return this.taskRepo
      .getMyTasks(filters)
      .pipe(map((response) => response.data));
  }

  /**
   * Get tasks to be received with filters
   * @param filters Task filters object
   * @returns Observable with paginated task data
   */
  getReceivedTasks(
    filters: TaskPaginationFilters
  ): Observable<TaskPaginationData> {
    return this.taskRepo
      .getReceivedTasks(filters)
      .pipe(map((response) => response.data));
  }

  /**
   * Get team tasks with filters
   * @param filters Task filters object
   * @returns Observable with paginated task data
   */
  getTeamTasks(filters: TaskPaginationFilters): Observable<TaskPaginationData> {
    return this.taskRepo
      .getTeamTasks(filters)
      .pipe(map((response) => response.data));
  }

  /**
   * Create a new task using FormData (supports file uploads).
   * @param formData FormData containing task details and files
   * @returns Observable emitting creation result data
   */
  createTask(formData: FormData): Observable<any> {
    return this.taskRepo
      .createTask(formData)
      .pipe(map((response) => response.data));
  }

  /**
   * Edit an existing task with updated data.
   * @param formData FormData containing updated task info and files
   * @returns Observable emitting edit operation result
   */
  editTask(formData: FormData): Observable<any> {
    return this.taskRepo
      .editTask(formData)
      .pipe(map((response) => response.data));
  }

  /**
   * Retrieve detailed information of a task by its ID.
   * @param id Unique identifier of the task
   * @returns Observable emitting detailed task data
   */
  getTaskById(id: number): Observable<TaskModel> {
    return this.taskRepo.getTaskById(id).pipe(map((response) => response.data));
  }

  /**
   * Soft delete a task (mark as deleted without permanent removal).
   * @param id ID of the task to soft delete
   * @returns Observable emitting result of delete operation
   */
  deleteTask(id: number): Observable<any> {
    return this.taskRepo.deleteTask(id).pipe(map((response) => response.data));
  }

  /**
   * Restore a previously soft-deleted task.
   * @param id ID of the task to restore
   * @returns Observable emitting result of restore operation
   */
  restoreTask(id: number): Observable<any> {
    return this.taskRepo.restoreTask(id).pipe(map((response) => response.data));
  }

  /**
   * Permanently delete a task (irreversible).
   * @param id ID of the task to permanently delete
   * @returns Observable emitting result of force delete operation
   */
  forceDeleteTask(id: number): Observable<any> {
    return this.taskRepo
      .forceDeleteTask(id)
      .pipe(map((response) => response.data));
  }

  /**
   * Retrieve all tasks that have been soft deleted.
   * @returns Observable emitting list of soft-deleted tasks
   */
  getDeletedTasks(): Observable<TaskModel[]> {
    return this.taskRepo
      .getDeletedTasks()
      .pipe(map((response) => response.data));
  }

  /**
   * Get summary data of task priorities within a specified date range.
   * @param startDate Start date (ISO string)
   * @param endDate End date (ISO string)
   * @returns Observable emitting priority summary data
   */
  getPrioritySummary(
    startDate: string,
    endDate: string
  ): Observable<TaskPriorityData> {
    return this.taskRepo
      .getPrioritySummary(startDate, endDate)
      .pipe(map((response) => response.data));
  }

  /**
   * Get task status summary filtered by user, date range, and priority.
   * @param userId Optional user ID to filter by
   * @param startDate Start date for filtering
   * @param endDate End date for filtering
   * @param priority Optional priority level to filter tasks
   * @returns Observable emitting status summary data
   */
  getStatusSummary(
    userId: number | null | undefined,
    startDate?: string,
    endDate?: string,
    priority?: number
  ): Observable<TaskStatusData> {
    // Build request parameters dynamically
    const effectiveUserId = userId ?? undefined; // remove if null/undefined

    return this.taskRepo
      .getStatusSummary(effectiveUserId, startDate, endDate, priority)
      .pipe(map((response) => response.data));
  }

  /**
   * Get task completion summary for a specific year and user.
   * @param year Year for which to get summary
   * @param userId User ID to filter completion data
   * @returns Observable emitting completion summary data
   */
  getCompletionSummary(
    year: number,
    userId: number
  ): Observable<TaskCompletionData> {
    return this.taskRepo
      .getCompletionSummary(year, userId)
      .pipe(map((response) => response.data));
  }

  /**
   * Archive a task by ID (soft archive).
   * @param id ID of the task to archive
   * @returns Observable emitting archive operation result
   */
  archiveTask(id: number): Observable<any> {
    return this.taskRepo.archiveTask(id).pipe(map((response) => response.data));
  }

  /**
   * Unarchive a previously archived task by ID.
   * @param id ID of the task to unarchive
   * @returns Observable emitting unarchive operation result
   */
  unarchiveTask(id: number): Observable<any> {
    return this.taskRepo
      .unarchiveTask(id)
      .pipe(map((response) => response.data));
  }

  /**
   * Retrieve all archived tasks.
   * @returns Observable emitting list of archived tasks
   */
  getArchivedTasks(): Observable<TaskModel[]> {
    return this.taskRepo
      .getArchivedTasks()
      .pipe(map((response) => response.data));
  }

  /**
   * Update task status with optional comment and files
   * @param taskId ID of task to update
   * @param statusId New status ID
   * @param comment Optional comment
   * @param files Optional files array
   * @returns Observable with update result
   */
  updateTaskStatus(
    taskId: number,
    statusId: number,
    comment: string = '',
    files: string[] = []
  ): Observable<any> {
    return this.taskRepo
      .updateTaskStatus(taskId, statusId, comment, files)
      .pipe(map((response) => response.data));
  }

  /**
   * Create a new comment on a task
   * @param taskId ID of task to comment on
   * @param comment Comment text
   * @param files Optional files to attach
   * @returns Observable with created comment
   */
  createComment(
    taskId: number,
    comment: string,
    files?: File[]
  ): Observable<any> {
    return this.taskRepo
      .createComment(taskId, comment, files)
      .pipe(map((response) => response.data));
  }

  /**
   * Get attendance status count (Present, Absent, Leaves)
   * @param day Day number
   * @param month Month number
   * @returns Observable with attendance status count data
   */
  getAttendanceStatusCount(day: number, month: number): Observable<any> {
    return this.taskRepo
      .getAttendanceStatusCount(day, month)
      .pipe(map((response) => response.data));
  }
}
