import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Issue, 
  CreateIssueRequest, 
  UpdateIssueRequest, 
  IssueListResponse,
  IssueFilters 
} from '../models/issue.model';

@Injectable({
  providedIn: 'root'
})
export class IssueService {
  private readonly apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  /**
   * Get health check
   */
  getHealth(): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(`${this.apiUrl}/health`);
  }

  /**
   * Get all issues with optional filters, search, sorting, and pagination
   */
  getIssues(filters: IssueFilters = {}): Observable<IssueListResponse> {
    let params = new HttpParams();

    if (filters.search) {
      params = params.set('search', filters.search);
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.priority) {
      params = params.set('priority', filters.priority);
    }
    if (filters.assignee) {
      params = params.set('assignee', filters.assignee);
    }
    if (filters.sortBy) {
      params = params.set('sortBy', filters.sortBy);
    }
    if (filters.sortOrder) {
      params = params.set('sortOrder', filters.sortOrder);
    }
    if (filters.page) {
      params = params.set('page', filters.page.toString());
    }
    if (filters.pageSize) {
      params = params.set('pageSize', filters.pageSize.toString());
    }

    return this.http.get<IssueListResponse>(`${this.apiUrl}/issues`, { params });
  }

  /**
   * Get a single issue by ID
   */
  getIssue(id: string): Observable<Issue> {
    return this.http.get<Issue>(`${this.apiUrl}/issues/${id}`);
  }

  /**
   * Create a new issue
   */
  createIssue(issue: CreateIssueRequest): Observable<Issue> {
    return this.http.post<Issue>(`${this.apiUrl}/issues`, issue);
  }

  /**
   * Update an existing issue
   */
  updateIssue(id: string, issue: UpdateIssueRequest): Observable<Issue> {
    return this.http.put<Issue>(`${this.apiUrl}/issues/${id}`, issue);
  }
}