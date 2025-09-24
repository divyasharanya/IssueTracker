from flask import Flask, request, jsonify
from flask_cors import CORS
from models import issue_store
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok"})


@app.route('/issues', methods=['GET'])
def get_issues():
    """
    Get all issues with optional search, filtering, sorting, and pagination
    Query parameters:
    - search: search by title
    - status: filter by status (Open, In Progress, Closed)
    - priority: filter by priority (Low, Medium, High, Critical)
    - assignee: filter by assignee (partial match)
    - sortBy: sort field (id, title, status, priority, assignee, createdAt, updatedAt)
    - sortOrder: sort order (asc, desc) - default: desc
    - page: page number (default: 1)
    - pageSize: items per page (default: 10)
    """
    try:
        # Get query parameters
        search = request.args.get('search', '').strip()
        status = request.args.get('status', '').strip()
        priority = request.args.get('priority', '').strip()
        assignee = request.args.get('assignee', '').strip()
        sort_by = request.args.get('sortBy', 'updatedAt').strip()
        sort_order = request.args.get('sortOrder', 'desc').strip()
        
        # Parse pagination parameters
        try:
            page = int(request.args.get('page', 1))
            page_size = int(request.args.get('pageSize', 10))
        except ValueError:
            return jsonify({"error": "Invalid pagination parameters"}), 400
        
        # Validate parameters
        if page < 1:
            page = 1
        if page_size < 1 or page_size > 100:
            page_size = 10
        
        if sort_order.lower() not in ['asc', 'desc']:
            sort_order = 'desc'
        
        valid_sort_fields = ['id', 'title', 'status', 'priority', 'assignee', 'createdAt', 'updatedAt']
        if sort_by not in valid_sort_fields:
            sort_by = 'updatedAt'
        
        # Get filtered and paginated results
        result = issue_store.search_and_filter(
            search=search,
            status=status,
            priority=priority,
            assignee=assignee,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            page_size=page_size
        )
        
        logger.info(f"GET /issues - returned {len(result['issues'])} issues")
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in get_issues: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@app.route('/issues/<issue_id>', methods=['GET'])
def get_issue(issue_id):
    """Get a single issue by ID"""
    try:
        issue = issue_store.get_by_id(issue_id)
        if not issue:
            return jsonify({"error": "Issue not found"}), 404
        
        logger.info(f"GET /issues/{issue_id} - found issue")
        return jsonify(issue.to_dict())
        
    except Exception as e:
        logger.error(f"Error in get_issue: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@app.route('/issues', methods=['POST'])
def create_issue():
    """
    Create a new issue
    Required fields: title
    Optional fields: description, status, priority, assignee
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Validate required fields
        if not data.get('title', '').strip():
            return jsonify({"error": "Title is required"}), 400
        
        # Prepare issue data
        issue_data = {
            'title': data['title'].strip(),
            'description': data.get('description', '').strip(),
            'status': data.get('status', 'Open').strip(),
            'priority': data.get('priority', 'Medium').strip(),
            'assignee': data.get('assignee', '').strip()
        }
        
        # Validate status and priority
        valid_statuses = ['Open', 'In Progress', 'Closed']
        valid_priorities = ['Low', 'Medium', 'High', 'Critical']
        
        if issue_data['status'] not in valid_statuses:
            issue_data['status'] = 'Open'
        
        if issue_data['priority'] not in valid_priorities:
            issue_data['priority'] = 'Medium'
        
        # Create the issue
        issue = issue_store.create(issue_data)
        
        logger.info(f"POST /issues - created issue {issue.id}")
        return jsonify(issue.to_dict()), 201
        
    except Exception as e:
        logger.error(f"Error in create_issue: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@app.route('/issues/<issue_id>', methods=['PUT'])
def update_issue(issue_id):
    """
    Update an existing issue
    Updates the updatedAt timestamp automatically
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Check if issue exists
        existing_issue = issue_store.get_by_id(issue_id)
        if not existing_issue:
            return jsonify({"error": "Issue not found"}), 404
        
        # Validate title if provided
        if 'title' in data and not data['title'].strip():
            return jsonify({"error": "Title cannot be empty"}), 400
        
        # Prepare update data
        update_data = {}
        
        if 'title' in data:
            update_data['title'] = data['title'].strip()
        if 'description' in data:
            update_data['description'] = data['description'].strip()
        if 'status' in data:
            valid_statuses = ['Open', 'In Progress', 'Closed']
            if data['status'] in valid_statuses:
                update_data['status'] = data['status']
        if 'priority' in data:
            valid_priorities = ['Low', 'Medium', 'High', 'Critical']
            if data['priority'] in valid_priorities:
                update_data['priority'] = data['priority']
        if 'assignee' in data:
            update_data['assignee'] = data['assignee'].strip()
        
        # Update the issue
        updated_issue = issue_store.update(issue_id, update_data)
        
        logger.info(f"PUT /issues/{issue_id} - updated issue")
        return jsonify(updated_issue.to_dict())
        
    except Exception as e:
        logger.error(f"Error in update_issue: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({"error": "Method not allowed"}), 405


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500


if __name__ == '__main__':
    logger.info("Starting Issue Tracker API server...")
    app.run(debug=True, host='0.0.0.0', port=5000)