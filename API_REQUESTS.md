# API Reference & Request Bodies Cheatsheet

**Base URL**: `http://localhost:5000/api`  
**Content-Type**: `application/json`  
**Authorization**: `Bearer <YOUR_JWT_TOKEN>` (for protected endpoints)

---

## Quick Navigation

- [1. Authentication APIs](#1-authentication-apis)
  - [POST /api/auth/register](#post-apiauthregister)
  - [POST /api/auth/login](#post-apiauthlogin)
  - [GET /api/auth/me](#get-apiauthme)
  - [PUT /api/auth/profile](#put-apiauthprofile)
- [2. Project Management APIs (MySQL)](#2-project-management-apis-mysql)
  - [POST /api/projects](#post-apiprojects)
  - [GET /api/projects](#get-apiprojects)
  - [GET /api/projects/:id](#get-apiprojectsid)
  - [PUT /api/projects/:id](#put-apiprojectsid)
  - [DELETE /api/projects/:id](#delete-apiprojectsid)
- [3. Task Management APIs (MongoDB)](#3-task-management-apis-mongodb)
  - [POST /api/tasks](#post-apitasks)
  - [GET /api/tasks (Filter & Paginate)](#get-apitasks-filtering--pagination)
  - [GET /api/tasks/:id](#get-apitasksid)
  - [PUT /api/tasks/:id](#put-apitasksid)
  - [DELETE /api/tasks/:id](#delete-apitasksid)
- [4. Dashboard Statistics API](#4-dashboard-statistics-api)
  - [GET /api/dashboard](#get-apidashboard)

---

## 1. Authentication APIs

### `POST /api/auth/register`
Create a new user account.

- **URL**: `http://localhost:5000/api/auth/register`
- **Method**: `POST`
- **Auth Required**: No
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "Password123"
  }
  ```
- **Field Constraints**:
  - `name`: string, required, 2 to 100 characters.
  - `email`: string, required, valid unique email.
  - `password`: string, required, minimum 6 characters.

---

### `POST /api/auth/login`
Authenticate user and obtain a JWT bearer token.

- **URL**: `http://localhost:5000/api/auth/login`
- **Method**: `POST`
- **Auth Required**: No
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "email": "john.doe@example.com",
    "password": "Password123"
  }
  ```
- **Field Constraints**:
  - `email`: string, required, valid email.
  - `password`: string, required.

---

### `GET /api/auth/me`
Retrieve currently logged-in user profile.

- **URL**: `http://localhost:5000/api/auth/me`
- **Method**: `GET`
- **Auth Required**: Yes
- **Headers**:
  ```http
  Authorization: Bearer <YOUR_JWT_TOKEN>
  ```
- **Request Body**: *None*

---

### `PUT /api/auth/profile`
Update the authenticated user's profile.

- **URL**: `http://localhost:5000/api/auth/profile`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Headers**:
  ```http
  Content-Type: application/json
  Authorization: Bearer <YOUR_JWT_TOKEN>
  ```
- **Request Body**:
  ```json
  {
    "name": "John Doe, Lead Developer",
    "email": "john.newemail@example.com",
    "password": "NewSecretPassword123"
  }
  ```
- **Field Constraints**:
  - All fields are optional, but at least one (`name`, `email`, or `password`) must be provided.
  - `email`: must not be taken by another user.
  - `password`: minimum 6 characters (automatically rehashed).

---

## 2. Project Management APIs (MySQL)

### `POST /api/projects`
Create a new project belonging to the authenticated user.

- **URL**: `http://localhost:5000/api/projects`
- **Method**: `POST`
- **Auth Required**: Yes
- **Headers**:
  ```http
  Content-Type: application/json
  Authorization: Bearer <YOUR_JWT_TOKEN>
  ```
- **Request Body**:
  ```json
  {
    "title": "E-Commerce Microservices",
    "description": "Building scalable backend services with Express and MySQL",
    "status": "active"
  }
  ```
- **Field Constraints**:
  - `title`: string, required, 2 to 150 characters.
  - `description`: string, optional.
  - `status`: string, optional (`active`, `completed`, `archived` - default: `active`).

---

### `GET /api/projects`
Get all projects owned by the authenticated user.

- **URL**: `http://localhost:5000/api/projects`
- **Method**: `GET`
- **Auth Required**: Yes
- **Headers**:
  ```http
  Authorization: Bearer <YOUR_JWT_TOKEN>
  ```
- **Request Body**: *None*

---

### `GET /api/projects/:id`
Get a specific project by its MySQL integer ID.

- **URL**: `http://localhost:5000/api/projects/1`
- **Method**: `GET`
- **Auth Required**: Yes
- **Headers**:
  ```http
  Authorization: Bearer <YOUR_JWT_TOKEN>
  ```
- **Request Body**: *None*

---

### `PUT /api/projects/:id`
Update an existing project owned by the user.

- **URL**: `http://localhost:5000/api/projects/1`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Headers**:
  ```http
  Content-Type: application/json
  Authorization: Bearer <YOUR_JWT_TOKEN>
  ```
- **Request Body**:
  ```json
  {
    "title": "E-Commerce Microservices Phase 2",
    "description": "Updated roadmap and architecture specifications",
    "status": "completed"
  }
  ```
- **Field Constraints**:
  - At least one field (`title`, `description`, or `status`) must be provided.
  - `status`: must be one of `active`, `completed`, `archived`.

---

### `DELETE /api/projects/:id`
Delete a project and cascade delete all its associated tasks in MongoDB.

- **URL**: `http://localhost:5000/api/projects/1`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Headers**:
  ```http
  Authorization: Bearer <YOUR_JWT_TOKEN>
  ```
- **Request Body**: *None*

---

## 3. Task Management APIs (MongoDB)

### `POST /api/tasks`
Create a task associated with a MySQL project and the authenticated user.

- **URL**: `http://localhost:5000/api/tasks`
- **Method**: `POST`
- **Auth Required**: Yes
- **Headers**:
  ```http
  Content-Type: application/json
  Authorization: Bearer <YOUR_JWT_TOKEN>
  ```
- **Request Body**:
  ```json
  {
    "title": "Setup Docker Compose",
    "description": "Configure MySQL 8.0 container on port 3307",
    "status": "todo",
    "priority": "high",
    "projectId": 1,
    "dueDate": "2026-11-20T18:00:00.000Z"
  }
  ```
- **Field Constraints**:
  - `title`: string, required, 2 to 200 characters.
  - `description`: string, optional.
  - `status`: string, optional (`todo`, `in_progress`, `completed` - default: `todo`).
  - `priority`: string, optional (`low`, `medium`, `high` - default: `medium`).
  - `projectId`: integer, required (must exist and belong to the authenticated user).
  - `dueDate`: ISO 8601 date string, optional.

---

### `GET /api/tasks` (Filtering & Pagination)
Get tasks owned by the authenticated user with optional filter parameters and pagination.

- **URL**: `http://localhost:5000/api/tasks?page=1&limit=10&status=todo&priority=high&projectId=1`
- **Method**: `GET`
- **Auth Required**: Yes
- **Headers**:
  ```http
  Authorization: Bearer <YOUR_JWT_TOKEN>
  ```
- **Query Parameters**:
  - `page`: integer (default: `1`)
  - `limit`: integer (default: `10`, max: `100`)
  - `status`: string (`todo`, `in_progress`, `completed`)
  - `priority`: string (`low`, `medium`, `high`)
  - `projectId`: integer
- **Request Body**: *None*

---

### `GET /api/tasks/:id`
Get a single task by its 24-character hexadecimal MongoDB ObjectId.

- **URL**: `http://localhost:5000/api/tasks/670cbe888f4cf7b8a10d96d2`
- **Method**: `GET`
- **Auth Required**: Yes
- **Headers**:
  ```http
  Authorization: Bearer <YOUR_JWT_TOKEN>
  ```
- **Request Body**: *None*

---

### `PUT /api/tasks/:id`
Update an existing task.

- **URL**: `http://localhost:5000/api/tasks/670cbe888f4cf7b8a10d96d2`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Headers**:
  ```http
  Content-Type: application/json
  Authorization: Bearer <YOUR_JWT_TOKEN>
  ```
- **Request Body**:
  ```json
  {
    "title": "Setup Docker Compose & Volumes",
    "description": "Added persistent volume mounting for MySQL",
    "status": "in_progress",
    "priority": "high",
    "dueDate": "2026-11-25T18:00:00.000Z",
    "projectId": 1
  }
  ```
- **Field Constraints**:
  - At least one field must be provided.
  - If `projectId` is updated, the new project must exist and belong to the user.

---

### `DELETE /api/tasks/:id`
Delete a task by its MongoDB ObjectId.

- **URL**: `http://localhost:5000/api/tasks/670cbe888f4cf7b8a10d96d2`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Headers**:
  ```http
  Authorization: Bearer <YOUR_JWT_TOKEN>
  ```
- **Request Body**: *None*

---

## 4. Dashboard Statistics API

### `GET /api/dashboard`
Retrieve real-time consolidated analytics across MySQL and MongoDB for the logged-in user.

- **URL**: `http://localhost:5000/api/dashboard`
- **Method**: `GET`
- **Auth Required**: Yes
- **Headers**:
  ```http
  Authorization: Bearer <YOUR_JWT_TOKEN>
  ```
- **Request Body**: *None*
- **Response Format**:
  ```json
  {
    "success": true,
    "message": "Dashboard statistics retrieved successfully",
    "data": {
      "totalProjects": 3,
      "activeProjects": 2,
      "completedProjects": 1,
      "totalTasks": 8,
      "pendingTasks": 5,
      "completedTasks": 3,
      "highPriorityTasks": 4,
      "breakdown": {
        "projects": {
          "total": 3,
          "active": 2,
          "completed": 1,
          "archived": 0
        },
        "tasks": {
          "total": 8,
          "pending": 5,
          "completed": 3,
          "highPriority": 4
        }
      }
    }
  }
  ```
