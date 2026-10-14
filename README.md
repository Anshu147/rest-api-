# Project & Task Management RESTful API

A production-ready, highly secure RESTful API built with **Node.js**, **Express**, **MySQL (Dockerized)**, and **MongoDB**. This project provides comprehensive authentication, project and task lifecycle management, cross-database data relationships, advanced pagination and filtering, and consolidated real-time dashboard analytics.

---

## 🌟 Technologies & Architecture

- **Runtime & Modules**: Node.js (v20+ / v22+), 
- **Web Framework**: Express.js with Helmet security headers, CORS, and Morgan logging
- **Relational Database (MySQL 8.0 in Docker)**:
  - Managed via **Sequelize ORM**
  - Handles `Users` and `Projects`
  - Enforces relational foreign keys, cascade deletes, and unique constraints
- **Document Database (MongoDB)**:
  - Managed via **Mongoose ODM**
  - Handles `Tasks` with status, priority, and date tracking
  - Cross-references MySQL User and Project IDs with compound indexes
- **Security & Authentication**:
  - Stateless **JWT (JSON Web Token)** Bearer Authentication
  - **Bcrypt** cryptographic password hashing with 10 salt rounds
  - Strict resource isolation (multi-tenancy) preventing horizontal privilege escalation
- **Validation & Error Handling**:
  - Express-Validator middleware chains with automated sanitization
  - Centralized error-handling middleware with uniform JSON response schemas
  - Pure arrow function syntax throughout the entire codebase

---

## 📁 Project Structure

```
project-task-management-api/
├── .env.example              # Sample environment configuration
├── .gitignore                # Git ignore rules
├── docker-compose.yml        # Docker Compose configuration for MySQL 8.0
├── package.json              # ES Module configuration and scripts
├── postman_collection.json   # Ready-to-import Postman / Thunder Client collection
├── README.md                 # Project documentation
├── src/
│   ├── config/
│   │   ├── env.js            # Centralized environment variable loader
│   │   ├── mysql.js          # Sequelize connection configuration
│   │   └── mongo.js          # Mongoose connection configuration
│   ├── controllers/
│   │   ├── authController.js       # Auth & Profile request handlers
│   │   ├── projectController.js    # Project CRUD handlers
│   │   ├── taskController.js       # Task CRUD, filtering, pagination handlers
│   │   └── dashboardController.js  # Consolidated statistics handler
│   ├── middleware/
│   │   ├── auth.js           # JWT verification and user extraction
│   │   ├── errorHandler.js   # Centralized error handler
│   │   ├── notFound.js       # 404 Route Not Found handler
│   │   └── validate.js       # Express-validator result processing
│   ├── models/
│   │   ├── User.js           # MySQL User model (Sequelize)
│   │   ├── Project.js        # MySQL Project model (Sequelize)
│   │   ├── Task.js           # MongoDB Task model (Mongoose)
│   │   └── index.js          # Relational associations and DB sync
│   ├── routes/
│   │   ├── authRoutes.js     # /api/auth routes
│   │   ├── projectRoutes.js  # /api/projects routes
│   │   ├── taskRoutes.js     # /api/tasks routes
│   │   ├── dashboardRoutes.js# /api/dashboard routes
│   │   └── index.js          # Main router & health check
│   ├── services/
│   │   ├── authService.js         # User registration, login, and profile logic
│   │   ├── projectService.js      # Project CRUD and cascade deletion
│   │   ├── taskService.js         # Task CRUD, filters, and cross-DB verification
│   │   └── dashboardService.js    # Parallel multi-DB query aggregations
│   ├── utils/
│   │   ├── apiError.js       # Custom operational error classes
│   │   ├── apiResponse.js    # Standardized response formatters
│   │   └── asyncHandler.js   # Async route wrapper
│   ├── app.js                # Express application configuration
│   └── server.js             # HTTP server entrypoint and graceful shutdown
└── tests/
    └── api.test.js           # 20+ automated integration tests
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18.x, v20.x, or v22.x)
- **Docker** and **Docker Compose**
- **MongoDB** running locally or via cloud (e.g., MongoDB Atlas / local service on port 27017)

### 2. Environment Configuration
Copy the sample `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Verify or adjust the `.env` settings:

```env
PORT=5000
NODE_ENV=development

# MySQL (Docker container)
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=project_task_db

# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/project_task_db

# JWT Configuration
JWT_SECRET=super_secret_jwt_key_project_and_task_management_2026_xyz
JWT_EXPIRES_IN=7d
```

> **Note on MySQL Port:** Host port `3307` is mapped to container port `3306` inside Docker to prevent conflicts with any local MySQL service that may already be listening on port 3306.

### 3. Start MySQL with Docker
Start the isolated MySQL container in the background:

```bash
npm run docker:up
# Or: docker compose up -d
```

To stop the Docker container when done:
```bash
npm run docker:down
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Run the Application

**Development Mode (with auto-restart via nodemon):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

When started, the API automatically synchronizes MySQL tables (`users`, `projects`) and connects to MongoDB.

---

## 🧪 Automated Testing

A comprehensive test suite of 20+ automated integration tests is included. It tests all endpoints end-to-end against live databases:

```bash
npm test
```

### Test Coverage includes:
- ✅ **Health Check**: `GET /api/health`
- ✅ **User Registration**: Validation, password hashing, JWT generation
- ✅ **Duplicate Email Handling**: Returns `409 Conflict`
- ✅ **Login Authentication**: Valid credentials vs. invalid credentials (`401 Unauthorized`)
- ✅ **Profile Management**: `GET /api/auth/me` and `PUT /api/auth/profile`
- ✅ **Project CRUD**: Creation, listing, retrieval by ID, updating, and cascade deletion
- ✅ **Task CRUD**: Creation with project verification, status & priority updates, deletion
- ✅ **Cross-Database Ownership Verification**: Prevents assigning tasks to projects owned by other users
- ✅ **Multi-Tenant Security**: Blocks cross-user project and task access (`403 Forbidden`)
- ✅ **Filtering & Pagination**: Status filter, priority filter, projectId filter, limit & page calculation
- ✅ **Dashboard Analytics**: Consolidated counts from MySQL and MongoDB
- ✅ **Cascade Cleanup**: Deleting a project automatically purges its associated tasks in MongoDB

---

## 📡 API Reference & Documentation

### Standard Response Schemas

**Success Response:**
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```

**Paginated Success Response:**
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": [ ... ],
  "pagination": {
    "totalRecords": 25,
    "totalPages": 3,
    "currentPage": 1,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

---

### 1. Authentication Endpoints

#### `POST /api/auth/register`
Register a new user account.

- **Body (JSON):**
  ```json
  {
    "name": "Alex Mercer",
    "email": "alex.mercer@example.com",
    "password": "Password123!"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": 1,
        "name": "Alex Mercer",
        "email": "alex.mercer@example.com",
        "createdAt": "2026-10-14T06:00:00.000Z",
        "updatedAt": "2026-10-14T06:00:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

#### `POST /api/auth/login`
Authenticate an existing user and obtain a JWT.

- **Body (JSON):**
  ```json
  {
    "email": "alex.mercer@example.com",
    "password": "Password123!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "id": 1,
        "name": "Alex Mercer",
        "email": "alex.mercer@example.com"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

#### `GET /api/auth/me`
Retrieve authenticated user profile.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "User profile retrieved successfully",
    "data": {
      "user": {
        "id": 1,
        "name": "Alex Mercer",
        "email": "alex.mercer@example.com",
        "createdAt": "2026-10-14T06:00:00.000Z"
      }
    }
  }
  ```

#### `PUT /api/auth/profile`
Update user profile information.
- **Headers:** `Authorization: Bearer <token>`
- **Body (JSON):**
  ```json
  {
    "name": "Alex Mercer, Lead Architect",
    "password": "NewPassword123!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "data": {
      "user": {
        "id": 1,
        "name": "Alex Mercer, Lead Architect",
        "email": "alex.mercer@example.com"
      }
    }
  }
  ```

---

### 2. Project Management Endpoints (MySQL)

All project endpoints require the `Authorization: Bearer <token>` header.

#### `POST /api/projects`
Create a new project.
- **Body (JSON):**
  ```json
  {
    "title": "Cloud Platform Modernization",
    "description": "Migrate core microservices to Kubernetes clusters",
    "status": "active"
  }
  ```
  *(Status options: `active`, `completed`, `archived` - default: `active`)*
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Project created successfully",
    "data": {
      "project": {
        "id": 1,
        "title": "Cloud Platform Modernization",
        "description": "Migrate core microservices to Kubernetes clusters",
        "status": "active",
        "userId": 1,
        "createdAt": "2026-10-14T06:05:00.000Z"
      }
    }
  }
  ```

#### `GET /api/projects`
List all projects belonging to the authenticated user.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Projects retrieved successfully",
    "data": {
      "total": 1,
      "projects": [ ... ]
    }
  }
  ```

#### `GET /api/projects/:id`
Retrieve a single project by its ID.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Project retrieved successfully",
    "data": {
      "project": { ... }
    }
  }
  ```

#### `PUT /api/projects/:id`
Update a project's details.
- **Body (JSON):**
  ```json
  {
    "title": "Cloud Platform Modernization Phase 2",
    "status": "completed"
  }
  ```
- **Response (200 OK)**

#### `DELETE /api/projects/:id`
Delete a project and automatically cascade deletion of all associated MongoDB tasks.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Project and associated tasks deleted successfully",
    "data": {
      "id": 1,
      "deleted": true
    }
  }
  ```

---

### 3. Task Management Endpoints (MongoDB)

All task endpoints require the `Authorization: Bearer <token>` header.

#### `POST /api/tasks`
Create a new task under a project. Validates that the `projectId` exists in MySQL and is owned by the current user.
- **Body (JSON):**
  ```json
  {
    "title": "Configure Helm Charts",
    "description": "Write Helm templates for API deployments",
    "status": "todo",
    "priority": "high",
    "projectId": 1,
    "dueDate": "2026-11-15T00:00:00.000Z"
  }
  ```
  *(Status options: `todo`, `in_progress`, `completed` - default: `todo`)*  
  *(Priority options: `low`, `medium`, `high` - default: `medium`)*
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Task created successfully",
    "data": {
      "task": {
        "title": "Configure Helm Charts",
        "description": "Write Helm templates for API deployments",
        "status": "todo",
        "priority": "high",
        "projectId": 1,
        "ownerId": 1,
        "dueDate": "2026-11-15T00:00:00.000Z",
        "createdAt": "2026-10-14T06:10:00.000Z",
        "id": "670cbe888f4cf7b8a10d96d2"
      }
    }
  }
  ```

#### `GET /api/tasks` (With Filtering & Pagination)
Retrieve tasks belonging to the authenticated user with optional filtering and pagination.
- **Query Parameters:**
  - `page` *(optional, integer, default: 1)*
  - `limit` *(optional, integer, 1-100, default: 10)*
  - `status` *(optional: `todo`, `in_progress`, `completed`)*
  - `priority` *(optional: `low`, `medium`, `high`)*
  - `projectId` *(optional, integer)*

- **Example Request:**
  `GET /api/tasks?page=1&limit=10&status=todo&priority=high&projectId=1`

- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Tasks retrieved successfully",
    "data": [
      {
        "id": "670cbe888f4cf7b8a10d96d2",
        "title": "Configure Helm Charts",
        "status": "todo",
        "priority": "high",
        "projectId": 1,
        "ownerId": 1
      }
    ],
    "pagination": {
      "totalRecords": 1,
      "totalPages": 1,
      "currentPage": 1,
      "limit": 10,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
  ```

#### `GET /api/tasks/:id`
Retrieve a single task by its MongoDB ObjectId.
- **Response (200 OK)**

#### `PUT /api/tasks/:id`
Update an existing task. If changing `projectId`, verifies the new project belongs to the user.
- **Body (JSON):**
  ```json
  {
    "status": "in_progress",
    "priority": "high"
  }
  ```
- **Response (200 OK)**

#### `DELETE /api/tasks/:id`
Delete a task.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Task deleted successfully",
    "data": {
      "id": "670cbe888f4cf7b8a10d96d2",
      "deleted": true
    }
  }
  ```

---

### 4. Dashboard Statistics Endpoint

#### `GET /api/dashboard`
Fetches real-time consolidated statistics for the authenticated user from both MySQL and MongoDB in parallel:
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Dashboard statistics retrieved successfully",
    "data": {
      "totalProjects": 4,
      "activeProjects": 2,
      "completedProjects": 2,
      "totalTasks": 15,
      "pendingTasks": 9,
      "completedTasks": 6,
      "highPriorityTasks": 5,
      "breakdown": {
        "projects": {
          "total": 4,
          "active": 2,
          "completed": 2,
          "archived": 0
        },
        "tasks": {
          "total": 15,
          "pending": 9,
          "completed": 6,
          "highPriority": 5
        }
      }
    }
  }
  ```

---

## 📬 Postman & Thunder Client Testing

Import the included `postman_collection.json` file into Postman or VSCode Thunder Client.

The collection features:
1. Automatic extraction and setting of the JWT `token` upon registration or login.
2. Dynamic substitution of `{{baseUrl}}`, `{{token}}`, `{{projectId}}`, and `{{taskId}}`.
3. Pre-configured request bodies and query parameters matching every requirement in the specification.
