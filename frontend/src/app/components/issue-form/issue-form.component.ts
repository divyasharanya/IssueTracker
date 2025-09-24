import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IssueService } from '../../services/issue.service';
import { 
  Issue, 
  CreateIssueRequest, 
  UpdateIssueRequest, 
  ISSUE_STATUSES, 
  ISSUE_PRIORITIES 
} from '../../models/issue.model';

@Component({
  selector: 'app-issue-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './issue-form.component.html',
  styleUrls: ['./issue-form.component.css']
})
export class IssueFormComponent implements OnInit {
  @Input() isEdit = false;
  @Input() issue: Issue | null = null;
  @Output() issueCreated = new EventEmitter<Issue>();
  @Output() issueUpdated = new EventEmitter<Issue>();
  @Output() cancelled = new EventEmitter<void>();

  // Form data
  title = '';
  description = '';
  status = 'Open';
  priority = 'Medium';
  assignee = '';

  // Form state
  loading = false;
  error = '';

  // Constants for templates
  statuses = ISSUE_STATUSES;
  priorities = ISSUE_PRIORITIES;

  constructor(private issueService: IssueService) {}

  ngOnInit(): void {
    if (this.isEdit && this.issue) {
      this.title = this.issue.title;
      this.description = this.issue.description;
      this.status = this.issue.status;
      this.priority = this.issue.priority;
      this.assignee = this.issue.assignee;
    }
  }

  onSubmit(): void {
    if (!this.title.trim()) {
      this.error = 'Title is required';
      return;
    }

    this.loading = true;
    this.error = '';

    if (this.isEdit && this.issue) {
      this.updateIssue();
    } else {
      this.createIssue();
    }
  }

  private createIssue(): void {
    const createRequest: CreateIssueRequest = {
      title: this.title.trim(),
      description: this.description.trim(),
      status: this.status,
      priority: this.priority,
      assignee: this.assignee.trim()
    };

    this.issueService.createIssue(createRequest).subscribe({
      next: (issue: Issue) => {
        this.loading = false;
        this.issueCreated.emit(issue);
      },
      error: (error) => {
        this.error = 'Failed to create issue. Please try again.';
        this.loading = false;
        console.error('Error creating issue:', error);
      }
    });
  }

  private updateIssue(): void {
    if (!this.issue) return;

    const updateRequest: UpdateIssueRequest = {
      title: this.title.trim(),
      description: this.description.trim(),
      status: this.status,
      priority: this.priority,
      assignee: this.assignee.trim()
    };

    this.issueService.updateIssue(this.issue.id, updateRequest).subscribe({
      next: (issue: Issue) => {
        this.loading = false;
        this.issueUpdated.emit(issue);
      },
      error: (error) => {
        this.error = 'Failed to update issue. Please try again.';
        this.loading = false;
        console.error('Error updating issue:', error);
      }
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  clearError(): void {
    this.error = '';
  }
}