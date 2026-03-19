# Admin Approval Workflow APIs

This directory contains admin-only API endpoints for managing content approval workflow.

## Endpoints

### GET /api/admin/pending-content

Retrieves paginated list of content items with status='pending' awaiting admin approval.

**Authentication:** Required (Admin role only)

**Query Parameters:**
- `categoryId` (optional): Filter by category ID
- `page` (optional, default: 1): Page number for pagination
- `limit` (optional, default: 20): Number of items per page

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "categoryId": 1,
      "type": "sign",
      "status": "pending",
      "titleEn": "Stop Sign",
      "titleKm": "សញ្ញាឈប់",
      "createdBy": 5,
      "createdAt": "2024-01-15T10:30:00Z",
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized (not authenticated)
- 403: Forbidden (not admin)
- 500: Server error

---

### POST /api/admin/approve/[contentId]

Approves pending content, changing status to 'active' and making it visible to students.

**Authentication:** Required (Admin role only)

**URL Parameters:**
- `contentId`: ID of the content item to approve

**Request Body:**
```json
{
  "comments": "Approved - content looks good" // optional
}
```

**Response:**
```json
{
  "id": 1,
  "status": "active",
  "approvedBy": 3,
  "approvedAt": "2024-01-15T11:00:00Z",
  "updatedAt": "2024-01-15T11:00:00Z",
  ...
}
```

**Side Effects:**
- Updates content status to 'active'
- Sets approvedBy and approvedAt fields
- Creates content_approvals record
- Creates audit log entry

**Status Codes:**
- 200: Success
- 400: Invalid content ID
- 401: Unauthorized
- 403: Forbidden (not admin)
- 404: Content not found
- 500: Server error

---

### POST /api/admin/reject/[contentId]

Rejects pending content with a required rejection reason.

**Authentication:** Required (Admin role only)

**URL Parameters:**
- `contentId`: ID of the content item to reject

**Request Body:**
```json
{
  "comments": "Needs more detail in description" // required
}
```

**Response:**
```json
{
  "id": 1,
  "status": "rejected",
  "updatedAt": "2024-01-15T11:00:00Z",
  ...
}
```

**Side Effects:**
- Updates content status to 'rejected'
- Creates content_approvals record with rejection reason
- Creates audit log entry

**Status Codes:**
- 200: Success
- 400: Invalid content ID or missing comments
- 401: Unauthorized
- 403: Forbidden (not admin)
- 404: Content not found
- 500: Server error

---

### PUT /api/admin/toggle-active/[contentId]

Toggles the isActive flag for content, controlling visibility to students.

**Authentication:** Required (Admin role only)

**URL Parameters:**
- `contentId`: ID of the content item

**Request Body:**
```json
{
  "isActive": false // required boolean
}
```

**Response:**
```json
{
  "id": 1,
  "isActive": false,
  "updatedAt": "2024-01-15T11:00:00Z",
  ...
}
```

**Side Effects:**
- Updates isActive flag
- Creates audit log entry

**Status Codes:**
- 200: Success
- 400: Invalid content ID or isActive not boolean
- 401: Unauthorized
- 403: Forbidden (not admin)
- 404: Content not found
- 500: Server error

---

## Authorization

All endpoints in this directory require:
1. Valid authentication session
2. User role = 'admin'

Non-admin users will receive a 403 Forbidden response.

## Audit Trail

All approval actions create entries in:
- `content_approvals` table: Records approval/rejection with admin ID and comments
- `audit_logs` table: Records all admin actions for accountability

## Testing

Property-based tests validate:
- Approval workflow state transitions (Property 5)
- Inactive content exclusion for students (Property 26)

Run tests with:
```bash
npm test approval-workflow
npm test inactive-content-exclusion
```
