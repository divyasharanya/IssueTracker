from datetime import datetime
from typing import Dict, Any, List, Optional
import uuid


class Issue:
    def __init__(self, title: str, description: str = "", status: str = "Open", 
                 priority: str = "Medium", assignee: str = "", issue_id: str = None):
        self.id = issue_id or str(uuid.uuid4())
        self.title = title
        self.description = description
        self.status = status  # Open, In Progress, Closed
        self.priority = priority  # Low, Medium, High, Critical
        self.assignee = assignee
        self.created_at = datetime.utcnow().isoformat() + 'Z'
        self.updated_at = datetime.utcnow().isoformat() + 'Z'
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'priority': self.priority,
            'assignee': self.assignee,
            'createdAt': self.created_at,
            'updatedAt': self.updated_at
        }
    
    def update(self, data: Dict[str, Any]) -> None:
        """Update issue fields and refresh updatedAt timestamp"""
        if 'title' in data:
            self.title = data['title']
        if 'description' in data:
            self.description = data['description']
        if 'status' in data:
            self.status = data['status']
        if 'priority' in data:
            self.priority = data['priority']
        if 'assignee' in data:
            self.assignee = data['assignee']
        
        self.updated_at = datetime.utcnow().isoformat() + 'Z'


class IssueStore:
    def __init__(self):
        self.issues: Dict[str, Issue] = {}
        self._initialize_sample_data()
    
    def _initialize_sample_data(self):
        """Initialize with some sample issues"""
        sample_issues = [
            Issue("Fix login bug", "Users cannot login with special characters in password", "Open", "High", "john.doe@example.com"),
            Issue("Update user profile UI", "Redesign user profile page with new branding", "In Progress", "Medium", "jane.smith@example.com"),
            Issue("Database performance optimization", "Query execution time is too slow for large datasets", "Open", "Critical", ""),
            Issue("Add email notifications", "Users should receive email notifications for important updates", "Closed", "Low", "mike.johnson@example.com"),
            Issue("Mobile app crashes on startup", "iOS app crashes when launched on older devices", "Open", "High", "sarah.wilson@example.com"),
        ]
        
        for issue in sample_issues:
            self.issues[issue.id] = issue
    
    def get_all(self) -> List[Issue]:
        return list(self.issues.values())
    
    def get_by_id(self, issue_id: str) -> Optional[Issue]:
        return self.issues.get(issue_id)
    
    def create(self, issue_data: Dict[str, Any]) -> Issue:
        issue = Issue(**issue_data)
        self.issues[issue.id] = issue
        return issue
    
    def update(self, issue_id: str, update_data: Dict[str, Any]) -> Optional[Issue]:
        issue = self.issues.get(issue_id)
        if issue:
            issue.update(update_data)
            return issue
        return None
    
    def search_and_filter(self, search: str = "", status: str = "", 
                         priority: str = "", assignee: str = "",
                         sort_by: str = "updatedAt", sort_order: str = "desc",
                         page: int = 1, page_size: int = 10) -> Dict[str, Any]:
        """Search, filter, sort and paginate issues"""
        issues = list(self.issues.values())
        
        # Search by title
        if search:
            issues = [issue for issue in issues if search.lower() in issue.title.lower()]
        
        # Filter by status
        if status:
            issues = [issue for issue in issues if issue.status.lower() == status.lower()]
        
        # Filter by priority
        if priority:
            issues = [issue for issue in issues if issue.priority.lower() == priority.lower()]
        
        # Filter by assignee
        if assignee:
            issues = [issue for issue in issues if assignee.lower() in issue.assignee.lower()]
        
        # Sort issues
        reverse_order = sort_order.lower() == "desc"
        if sort_by == "createdAt":
            issues.sort(key=lambda x: x.created_at, reverse=reverse_order)
        elif sort_by == "updatedAt":
            issues.sort(key=lambda x: x.updated_at, reverse=reverse_order)
        elif sort_by == "title":
            issues.sort(key=lambda x: x.title.lower(), reverse=reverse_order)
        elif sort_by == "status":
            issues.sort(key=lambda x: x.status.lower(), reverse=reverse_order)
        elif sort_by == "priority":
            priority_order = {"low": 1, "medium": 2, "high": 3, "critical": 4}
            issues.sort(key=lambda x: priority_order.get(x.priority.lower(), 0), reverse=reverse_order)
        elif sort_by == "assignee":
            issues.sort(key=lambda x: x.assignee.lower(), reverse=reverse_order)
        
        # Pagination
        total = len(issues)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_issues = issues[start_idx:end_idx]
        
        return {
            'issues': [issue.to_dict() for issue in paginated_issues],
            'pagination': {
                'page': page,
                'pageSize': page_size,
                'total': total,
                'totalPages': (total + page_size - 1) // page_size
            }
        }


# Global instance
issue_store = IssueStore()