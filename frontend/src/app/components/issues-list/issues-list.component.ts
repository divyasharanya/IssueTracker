import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IssueService } from '../../services/issue.service';
import { IssueFormComponent } from '../issue-form/issue-form.component';
import { 
  Issue, 
  IssueListResponse, 
  IssueFilters, 
  ISSUE_STATUSES, 
  ISSUE_PRIORITIES 
} from '../../models/issue.model';

@Component({
  selector: 'app-issues-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IssueFormComponent],
  templateUrl: './issues-list.component.html',
  styleUrls: ['./issues-list.component.css']
})
export class IssuesListComponent implements OnInit {
  issues: Issue[] = [];
  loading = false;
  error = '';
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  totalItems = 0;

  // Filters and search
  searchTerm = '';
  statusFilter = '';
  priorityFilter = '';
  assigneeFilter = '';
  
  // Sorting
  sortBy = 'updatedAt';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Constants for templates
  statuses = ISSUE_STATUSES;
  priorities = ISSUE_PRIORITIES;

  // Selected issue for detail view
  selectedIssue: Issue | null = null;
  showDetailModal = false;
  showCreateModal = false;
  showEditModal = false;
  editingIssue: Issue | null = null;

  constructor(private issueService: IssueService) {}

  ngOnInit(): void {
    this.loadIssues();
  }

  loadIssues(): void {
    this.loading = true;
    this.error = '';

    const filters: IssueFilters = {
      search: this.searchTerm.trim(),
      status: this.statusFilter,
      priority: this.priorityFilter,
      assignee: this.assigneeFilter.trim(),
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    this.issueService.getIssues(filters).subscribe({
      next: (response: IssueListResponse) => {
        this.issues = response.issues;
        this.totalPages = response.pagination.totalPages;
        this.totalItems = response.pagination.total;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load issues. Please try again.';
        this.loading = false;
        console.error('Error loading issues:', error);
      }
    });
  }

  // Search and filter methods
  onSearchChange(): void {
    this.currentPage = 1;
    this.loadIssues();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadIssues();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.priorityFilter = '';
    this.assigneeFilter = '';
    this.currentPage = 1;
    this.loadIssues();
  }

  // Sorting methods
  onSort(column: string): void {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }
    this.loadIssues();
  }

  getSortIcon(column: string): string {
    if (this.sortBy !== column) return 'fas fa-sort';
    return this.sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
  }

  // Pagination methods
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadIssues();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadIssues();
  }

  // Modal methods
  viewIssueDetail(issue: Issue): void {
    this.selectedIssue = issue;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedIssue = null;
  }

  openCreateModal(): void {
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  openEditModal(issue: Issue): void {
    this.editingIssue = { ...issue };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingIssue = null;
  }

  // CRUD operations
  onIssueCreated(): void {
    this.closeCreateModal();
    this.loadIssues();
  }

  onIssueUpdated(): void {
    this.closeEditModal();
    this.loadIssues();
  }

  // Utility methods
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getPriorityClass(priority: string): string {
    const priorityClasses: { [key: string]: string } = {
      'Low': 'badge bg-secondary',
      'Medium': 'badge bg-primary',
      'High': 'badge bg-warning',
      'Critical': 'badge bg-danger'
    };
    return priorityClasses[priority] || 'badge bg-secondary';
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'Open': 'badge bg-success',
      'In Progress': 'badge bg-info',
      'Closed': 'badge bg-dark'
    };
    return statusClasses[status] || 'badge bg-secondary';
  }

  getPaginationArray(): number[] {
    const maxVisible = 5;
    const start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(this.totalPages, start + maxVisible - 1);
    
    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}