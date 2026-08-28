# SNEC Technical Assessment - Task & Project Management System

This repository contains the Full Stack Developer practical assessment submission for the Samastha National Education Council (SNEC).

## Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (recommended)

### Running with Docker Compose
To build and run the entire stack (Next.js frontend, NestJS backend API, and PostgreSQL database) in containers:
```bash
docker-compose up --build
```
Once fully started:
- Frontend Client: http://localhost:3000
- Backend API Server: http://localhost:3001

### Running Locally (Without Docker)

1. **Database Setup**
   Ensure PostgreSQL is running locally. Create a database named `snec` and configure the connection URL in `backend/.env` (refer to `.env.example`).

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   npx prisma migrate dev
   npx ts-node prisma/seed.ts
   npm run start:dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Default Test Accounts
The database seed script sets up the following default users and credentials for testing the role-based access control (RBAC) matrix:
- **Super Admin**: `admin@snec.in` / `admin123`
- **Admin**: `admin2@snec.in` / `password123`
- **Project Manager**: `pm@snec.in` / `password123`
- **Team Lead**: `lead@snec.in` / `password123`
- **Developer**: `dev@snec.in` / `password123`

## Running Tests
To run the NestJS service unit tests:
```bash
cd backend
npm test
```
