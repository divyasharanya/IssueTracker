export interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignee: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIssueRequest {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assignee?: string;
}

export interface UpdateIssueRequest {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assignee?: string;
}

export interface IssueListResponse {
  issues: Issue[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface IssueFilters {
  search?: string;
  status?: string;
  priority?: string;
  assignee?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export const ISSUE_STATUSES = ['Open', 'In Progress', 'Closed'] as const;
export const ISSUE_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const;