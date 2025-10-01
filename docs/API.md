# API Documentation

This document describes the REST API endpoints provided by the LANT-v3 backend.

## Base URL

All API endpoints are relative to the base URL:
```
http://localhost:5000
```

## Authentication

Currently, the application does not implement authentication. All endpoints are accessible without authentication.

## Endpoints

### Workspace Management

#### Get All Workspaces
```http
GET /api/workspaces
```

**Response:**
```json
{
  "workspaces": [
    {
      "id": "workspace_id",
      "name": "Workspace Name",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Workspace
```http
POST /api/workspaces
Content-Type: application/json

{
  "name": "New Workspace"
}
```

**Response:**
```json
{
  "id": "workspace_id",
  "name": "New Workspace",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### Delete Workspace
```http
DELETE /api/workspaces/{workspace_id}
```

**Response:**
```json
{
  "message": "Workspace deleted successfully"
}
```

### Sessions

#### Get Sessions for Workspace
```http
GET /api/workspaces/{workspace_id}/sessions
```

**Response:**
```json
{
  "sessions": [
    {
      "id": "session_id",
      "name": "Session Name",
      "workspace_id": "workspace_id",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Session
```http
POST /api/workspaces/{workspace_id}/sessions
Content-Type: application/json

{
  "name": "New Session"
}
```

**Response:**
```json
{
  "id": "session_id",
  "name": "New Session",
  "workspace_id": "workspace_id",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### Delete Session
```http
DELETE /api/sessions/{session_id}
```

**Response:**
```json
{
  "message": "Session deleted successfully"
}
```

### Messages

#### Get Messages for Session
```http
GET /api/sessions/{session_id}/messages
```

**Response:**
```json
{
  "messages": [
    {
      "id": "message_id",
      "session_id": "session_id",
      "role": "user|assistant",
      "content": "Message content",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Send Message
```http
POST /api/sessions/{session_id}/messages
Content-Type: application/json

{
  "message": "User message",
  "model": "qwen2.5-coder:3b-instruct",
  "temperature": 0.7,
  "max_tokens": 2048
}
```

**Response:**
```json
{
  "response": "AI response",
  "model": "qwen2.5-coder:3b-instruct",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Documents

#### Upload Document
```http
POST /api/workspaces/{workspace_id}/documents
Content-Type: multipart/form-data

file: [file]
```

**Response:**
```json
{
  "message": "Document uploaded successfully",
  "filename": "document.pdf",
  "size": 12345
}
```

#### Get Documents for Workspace
```http
GET /api/workspaces/{workspace_id}/documents
```

**Response:**
```json
{
  "documents": [
    {
      "id": "document_id",
      "filename": "document.pdf",
      "workspace_id": "workspace_id",
      "size": 12345,
      "uploaded_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Delete Document
```http
DELETE /api/documents/{document_id}
```

**Response:**
```json
{
  "message": "Document deleted successfully"
}
```

### Learning Tools

#### Generate Questions
```http
POST /api/sessions/{session_id}/generate-questions
```

**Response:**
```json
{
  "questions": [
    {
      "question": "Generated question 1",
      "context": "Relevant context"
    }
  ]
}
```

#### Summarize Conversation
```http
POST /api/sessions/{session_id}/summarize
```

**Response:**
```json
{
  "summary": "Conversation summary"
}
```

#### Merge Sessions
```http
POST /api/workspaces/{workspace_id}/merge-sessions
Content-Type: application/json

{
  "session_ids": ["session_id_1", "session_id_2"],
  "merged_name": "Merged Session"
}
```

**Response:**
```json
{
  "id": "new_session_id",
  "name": "Merged Session",
  "workspace_id": "workspace_id",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Clear Conversation
```http
DELETE /api/sessions/{session_id}/messages
```

**Response:**
```json
{
  "message": "Conversation cleared successfully"
}
```

### Models

#### Get Available Models
```http
GET /api/models
```

**Response:**
```json
{
  "models": [
    {
      "name": "qwen2.5-coder:3b-instruct",
      "description": "Qwen2.5 Coder 3B Instruct",
      "size": "1.9GB"
    }
  ]
}
```

### System

#### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 3600
}
```

## Error Handling

All endpoints may return error responses with the following format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Common Error Codes

- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error
- `413 Payload Too Large`: File size exceeds limit

## File Upload Limits

- Maximum file size: 100MB
- Supported formats: PDF, PPT, PPTX, DOCX, TXT, MD, PNG, JPG, JPEG, BMP, TIFF, GIF

## Rate Limiting

Currently, no rate limiting is implemented. This may be added in future versions.