# QuickNotes API Design Document

## 1. Overview
This document outlines the RESTful API specification for the production-ready QuickNotes backend service, designed to scale to 1 million daily active users. All requests and responses communicate using JSON payloads over HTTPS.

---

## 2. REST Endpoints Table

| Method | Endpoint | Description | Success Status Code |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/notes` | Retrieve a paginated list of notes for the authenticated user | `200 OK` |
| **POST** | `/api/v1/notes` | Create a new note | `201 Created` |
| **GET** | `/api/v1/notes/{id}` | Retrieve a single note by its unique identifier | `200 OK` |
| **PUT** | `/api/v1/notes/{id}` | Fully update an existing note | `200 OK` |
| **DELETE** | `/api/v1/notes/{id}` | Delete a specific note | `204 No Content` |
| **GET** | `/api/v1/users/{id}/notes` | Retrieve all notes authored by a specific user | `200 OK` |

---

## 3. Request and Response Examples

### Creating a Note (`POST /api/v1/notes`)
* **Request JSON Body:**
  ```json
  {
    "title": "System Architecture Draft",
    "body": "Finalize the read replica scaling boundaries and cache invalidation hooks.",
    "userId": "123e4567-e89b-12d3-a456-426614174000"
  }
  ```
### Response JSON Body[201 created]
```json
{
  "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "title": "System Architecture Draft",
  "body": "Finalize the read replica scaling boundaries and cache invalidation hooks.",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "createdAt": "2026-10-31T12:00:00Z",
  "updatedAt": "2026-10-31T12:00:00Z"
}
```
### Listing Notes (GET /api/v1/notes)
```json
{
  "page": 1,
  "limit": 10,
  "total": 42,
  "data": [
    {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "title": "System Architecture Draft",
      "body": "Finalize the read replica scaling boundaries and cache invalidation hooks.",
      "createdAt": "2026-10-31T12:00:00Z"
    }
  ]
}
```

## 4. Error Status Codes and Handling
* **`400 Bad Request`**: The request payload failed validation (e.g., missing title or title exceeding 100 characters).
* **`401 Unauthorized`**: Authentication token is missing, expired, or invalid.
* **`403 Forbidden`**: The authenticated user lacks permission to access or modify the requested resource.
* **`404 Not Found`**: The requested note or user resource does not exist.
* **`500 Internal Server Error`**: An unexpected error occurred on the server (e.g., database connection failure).

### Example Error Response Body (400 Bad Request)
```json
{
  "error": {
    "code": 400,
    "status": "Bad Request",
    "message": "Validation failed: 'title' is required and must not exceed 100 characters."
  }
}
```