<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
<p align="center">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
</p>

# User & Task Management API

A RESTful API for managing users and tasks with JWT authentication and role-based access control.

## Tech Stack

- Node.js (LTS)
- NestJS
- TypeScript
- TypeORM
- PostgreSQL (Supabase compatible)
- Supabase (S3) <s>LocalStack (S3-compatible storage)</s>

## Features

- JWT-based authentication (register/login)
- Role-based access control (Admin/User)
- Task management with lifecycle (pending → in_progress → done)
- Bulk task creation via CSV upload
- Pagination and filtering
- Global logging with request IDs
- Swagger documentation

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm or yarn

## Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd user-task-manager-api
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Run with Docker Compose

```bash
docker-compose up -d
```

This starts:

- PostgreSQL database
- <s>LocalStack</s> or Supabase (S3)
- API server

### 4. Run Locally (Development)

```bash
# Start database and LocalStack
# docker-compose up -d db localstack

# Run the API
npm run start:dev
```

## API Documentation

Swagger documentation is available at:

```
http://localhost:3000/api/docs
```

## API Endpoints

### Authentication

| Method | Endpoint         | Description       |
| ------ | ---------------- | ----------------- |
| POST   | `/auth/register` | Register new user |
| POST   | `/auth/login`    | Login             |

### Users (Admin only)

| Method | Endpoint     | Description      |
| ------ | ------------ | ---------------- |
| GET    | `/users`     | List all users   |
| GET    | `/users/profile`  | Get current user |
| GET    | `/users/:id` | Get user by ID   |
| PATCH  | `/users/:id` | Update user      |
| DELETE | `/users/:id` | Delete user      |

### Tasks

| Method | Endpoint             | Description            |
| ------ | -------------------- | ---------------------- |
| POST   | `/tasks`             | Create task            |
| POST   | `/tasks/bulk-upload` | Bulk create from CSV   |
| GET    | `/tasks`             | List tasks (paginated) |
| GET    | `/tasks/:id`         | Get task by ID         |
| PATCH  | `/tasks/:id`         | Update task            |
| DELETE | `/tasks/:id`         | Delete task            |

## CSV Format for Bulk Upload

```csv
title,description,status,priority,dueDate
Task 1,Description 1,pending,high,2026-03-01
Task 2,Description 2,in_progress,medium,2026-03-15
```

### Valid Values

- **status**: `pending`, `in_progress`, `done`
- **priority**: `low`, `medium`, `high`
- **dueDate**: ISO 8601 format (e.g., `2026-03-01`)

## Running Tests

```bash
# Unit tests
npm run test

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## Database Schema

### Users

| Column    | Type    | Description     |
| --------- | ------- | --------------- |
| id        | UUID    | Primary key     |
| email     | VARCHAR | Unique email    |
| password  | VARCHAR | Hashed password |
| fullName  | VARCHAR | Full Name       |
| role      | ENUM    | admin/user      |
| isActive  | BOOLEAN | Account status  |

### Tasks

| Column      | Type      | Description              |
| ----------- | --------- | ------------------------ |
| id          | UUID      | Primary key              |
| title       | VARCHAR   | Task title               |
| description | TEXT      | Task description         |
| status      | ENUM      | pending/in_progress/done |
| priority    | ENUM      | low/medium/high          |
| dueDate     | TIMESTAMP | Due date                 |
| userId      | UUID      | Foreign key to users     |

## License

[MIT](https://github.com/nestjs/nest/blob/master/LICENSE).
