import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TaskApiResponse,
  TaskCompletionData,
  TaskModel,
  TaskPaginationData,
  TaskPaginationFilters,
  TaskPriorityData,
  TaskStatusData,
} from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskRepository {
  // Base API URL for task-related endpoints
  private readonly baseUrl = `${environment.apiUrl}/tasks`;
  private readonly commentsUrl = 'http://192.168.1.27:8080/api/v1/comments';
  private readonly statusUrl = 'http://192.168.1.27:8080/api/v1/update-status'; // Added new URL

  constructor(private http: HttpClient) {}

  /**
   * Fetch paginated list of tasks with optional filters.
   * @param filters TaskPaginationFilters object containing filter parameters
   * @returns Observable wrapping API response with paginated task data
   */
  getPaginatedTasks(
    filters: TaskPaginationFilters
  ): Observable<TaskApiResponse<TaskPaginationData>> {
    const url = `${this.baseUrl}/pagination`;
    let params = new HttpParams();

    // Convert filter object entries to HTTP query parameters, ignoring null/undefined/empty strings
    for (const [key, value] of Object.entries(filters)) {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    }

    return this.http.get<TaskApiResponse<TaskPaginationData>>(url, { params });
  }

  /**
   * Get user's tasks with filters
   * @param filters Task filters object
   * @returns Observable with paginated task data
   */
  getMyTasks(
    filters: TaskPaginationFilters
  ): Observable<TaskApiResponse<TaskPaginationData>> {
    const url = `${this.baseUrl}/my`;
    let params = new HttpParams();

    // Convert filter object entries to HTTP query parameters, ignoring null/undefined/empty strings
    for (const [key, value] of Object.entries(filters)) {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    }

    return this.http.get<TaskApiResponse<TaskPaginationData>>(url, {
      params,
    });
  }

  /**
   * Get tasks to be received with filters
   * @param filters Task filters object
   * @returns Observable with paginated task data
   */
  getReceivedTasks(
    filters: TaskPaginationFilters
  ): Observable<TaskApiResponse<TaskPaginationData>> {
    const url = `${this.baseUrl}/receive`;
    let params = new HttpParams();

    // Convert filter object entries to HTTP query parameters, ignoring null/undefined/empty strings
    for (const [key, value] of Object.entries(filters)) {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    }

    return this.http.get<TaskApiResponse<TaskPaginationData>>(url, {
      params,
    });
  }

  /**
   * Get team tasks with filters
   * @param filters Task filters object
   * @returns Observable with paginated task data
   */
  getTeamTasks(
    filters: TaskPaginationFilters
  ): Observable<TaskApiResponse<TaskPaginationData>> {
    const url = `${this.baseUrl}/team`;
    let params = new HttpParams();

    // Convert filter object entries to HTTP query parameters, ignoring null/undefined/empty strings
    for (const [key, value] of Object.entries(filters)) {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    }

    return this.http.get<TaskApiResponse<TaskPaginationData>>(url, {
      params,
    });
  }

  /**
   * Create a new task using multipart/form-data.
   * @param formData FormData containing task data and files
   * @returns Observable wrapping API response
   */
  createTask(formData: FormData): Observable<TaskApiResponse<any>> {
    const url = `${this.baseUrl}/create`;
    return this.http.post<TaskApiResponse<any>>(url, formData);
  }

  /**
   * Edit an existing task using multipart/form-data.
   * @param formData FormData containing updated task data and files
   * @returns Observable wrapping API response
   */
  editTask(formData: FormData): Observable<TaskApiResponse<any>> {
    const url = `${this.baseUrl}/edit`;
    return this.http.put<TaskApiResponse<any>>(url, formData);
  }

  /**
   * Retrieve task details by its unique ID.
   * @param id Task ID
   * @returns Observable wrapping API response containing task details
   */
  getTaskById(id: number): Observable<TaskApiResponse<TaskModel>> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.get<TaskApiResponse<TaskModel>>(url);
  }

  /**
   * Soft delete a task by marking it as deleted.
   * @param id Task ID
   * @returns Observable wrapping API response
   */
  deleteTask(id: number): Observable<TaskApiResponse<any>> {
    const url = `${this.baseUrl}/delete/${id}`;
    return this.http.post<TaskApiResponse<any>>(url, null);
  }

  /**
   * Restore a previously soft-deleted task.
   * @param id Task ID
   * @returns Observable wrapping API response
   */
  restoreTask(id: number): Observable<TaskApiResponse<any>> {
    const url = `${this.baseUrl}/restore/${id}`;
    return this.http.post<TaskApiResponse<any>>(url, null);
  }

  /**
   * Permanently delete a task from the system.
   * @param id Task ID
   * @returns Observable wrapping API response
   */
  forceDeleteTask(id: number): Observable<TaskApiResponse<any>> {
    const url = `${this.baseUrl}/forcedelete/${id}`;
    return this.http.delete<TaskApiResponse<any>>(url);
  }

  /**
   * Retrieve a list of all soft-deleted tasks.
   * @returns Observable wrapping API response with array of deleted tasks
   */
  getDeletedTasks(): Observable<TaskApiResponse<TaskModel[]>> {
    return this.http.get<TaskApiResponse<TaskModel[]>>(
      `${this.baseUrl}/deleted/index`
    );
  }

  /**
   * Get a summary of task priorities within a specific date range.
   * @param startDate Start date (ISO string)
   * @param endDate End date (ISO string)
   * @returns Observable wrapping API response with priority counts
   */
  getPrioritySummary(
    startDate: string,
    endDate: string
  ): Observable<TaskApiResponse<TaskPriorityData>> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<TaskApiResponse<TaskPriorityData>>(
      `${this.baseUrl}/priority`,
      { params }
    );
  }

  /**
   * Get task status summary with filters for user, date range, and priority.
   * @param userId Optional user ID to filter tasks by assignee or creator
   * @param startDate Start date for filtering
   * @param endDate End date for filtering
   * @param priority Optional priority level to filter by
   * @returns Observable wrapping API response with status summary data
   */
  getStatusSummary(
    userId?: number,
    startDate?: string,
    endDate?: string,
    priority?: number
  ): Observable<TaskApiResponse<TaskStatusData>> {
    let params = new HttpParams();

    if (userId !== undefined && userId !== null) {
      params = params.set('UserId', userId.toString());
    }
    if (startDate) {
      params = params.set('StartDate', startDate);
    }
    if (endDate) {
      params = params.set('EndDate', endDate);
    }
    if (priority !== undefined && priority !== null) {
      params = params.set('Priority', priority.toString());
    }

    return this.http.get<TaskApiResponse<TaskStatusData>>(
      `${this.baseUrl}/status`,
      { params }
    );
  }

  /**
   * Get task completion summary data for a given year and user.
   * @param year Year to filter completion data
   * @param userId User ID for filtering completion stats
   * @returns Observable wrapping API response with completion statistics
   */
  getCompletionSummary(
    year: number,
    userId: number
  ): Observable<TaskApiResponse<TaskCompletionData>> {
    let params = new HttpParams()
      .set('Year', year.toString())
      .set('UserId', userId.toString());
    return this.http.get<TaskApiResponse<TaskCompletionData>>(
      `${this.baseUrl}/completion`,
      { params }
    );
  }

  /**
   * Archive a task by marking it as archived.
   * @param id Task ID to archive
   * @returns Observable wrapping API response
   */
  archiveTask(id: number): Observable<TaskApiResponse<any>> {
    return this.http.post<TaskApiResponse<any>>(
      `${this.baseUrl}/archive/${id}`,
      null
    );
  }

  /**
   * Unarchive a previously archived task.
   * @param id Task ID to unarchive
   * @returns Observable wrapping API response
   */
  unarchiveTask(id: number): Observable<TaskApiResponse<any>> {
    return this.http.post<TaskApiResponse<any>>(
      `${this.baseUrl}/unarchive/${id}`,
      null
    );
  }

  /**
   * Get list of all archived tasks.
   * @returns Observable wrapping API response with archived tasks array
   */
  getArchivedTasks(): Observable<TaskApiResponse<TaskModel[]>> {
    return this.http.get<TaskApiResponse<TaskModel[]>>(
      `${this.baseUrl}/archived`
    );
  }

  /**
   * Update task status
   * @param taskId The ID of the task to update
   * @param statusId The new status ID
   * @param comment Optional comment for the status update
   * @param files Optional array of files for the update
   * @returns Observable with the update result
   */
  updateTaskStatus(
    taskId: number,
    statusId: number,
    comment: string = '',
    files: string[] = []
  ): Observable<TaskApiResponse<any>> {
    let formData = new FormData();

    formData.append('TaskId', taskId.toString());
    formData.append('Status', statusId.toString());
    formData.append('Comment', comment);

    if (files.length > 0) {
      files.forEach((file) => {
        formData.append('Files', file);
      });
    }

    return this.http.post<TaskApiResponse<any>>(this.statusUrl, formData); // Updated to use statusUrl
  }

  /**
   * Create a new comment for a task
   * @param taskId The ID of the task to comment on
   * @param comment The comment text
   * @param files Optional files to upload with the comment
   * @returns Observable with the created comment
   */
  createComment(
    taskId: number,
    comment: string,
    files?: File[]
  ): Observable<TaskApiResponse<any>> {
    const url = `${this.commentsUrl}/create`;
    const formData = new FormData();

    formData.append('TaskId', taskId.toString());
    formData.append('Comment', comment);

    if (files) {
      files.forEach((file) => {
        formData.append('Files', file);
      });
    }

    return this.http.post<TaskApiResponse<any>>(url, formData);
  }

  /**
   * Get attendance status count (Present, Absent, Leaves)
   * @returns Observable with attendance status count data
   */
  getAttendanceStatusCount(day: number, month: number): Observable<any> {
    const url = `${environment.apiUrl}/attendance/status/count?Day=${day}&Month=${month}`;
    return this.http.get<any>(url);
  }
}
