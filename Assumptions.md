# Technical Assumptions & Known Limitations

This document outlines key technical assumptions, design choices, and architectural limitations in this submission for the SNEC Technical Assessment.

## Assumptions

### 1. Authentication & Security
* **Password Reset Flow:** The forgot and reset password endpoints are mocked on the backend to simplify local testing and evaluation. The server outputs generated mock reset tokens to the console log. The frontend reset password views were omitted from the initial MVP scope to optimize implementation time.
* **Token Rotation:** Refresh tokens expire in 7 days and are rotated on every token refresh request to prevent hijacking. Logout revokes the token session immediately in the database.
* **Security Standards:** Passwords are encrypted using `bcrypt` (10 rounds). JWT payloads encode userId, email, role name, and the list of active permissions.

### 2. User Management
* **Profile Pictures:** The database schema tracks `profilePicture` URLs. For evaluation, avatars are dynamically loaded via placeholders, bypassing client-side image upload logic.
* **Mobile Field:** The `mobile` phone field is validated on form submit but remains optional.

### 3. File Attachments
* **Local Storage:** Task attachment uploads are processed using NestJS Multer middleware, restricted to standard documents and images (`png`, `jpeg`, `jpg`, `pdf`, `doc`, `docx`, `txt`), and capped at a maximum file size of 10MB. Local uploads are written to `/uploads` on the local file system rather than an external block storage (like AWS S3).

### 4. Database Setup & Seeding
* **Database Version:** PostgreSQL 14+ is assumed.
* **Prisma Schema:** Schema migrations are fully tracked via Prisma. The initial migrations history is committed to the repository to allow clean database setup using `npx prisma migrate deploy`.

---

## Known Limitations

### 1. Real-time Updates
* **Polling:** The application uses React Query polling (refetch intervals) to retrieve comments, activities, and notifications. For high-scale production, this should be refactored to use WebSockets.

### 2. Email Notifications
* **Console Mocking:** Email notification dispatch is mocked and outputs the email body directly to the server logs.

### 3. Attachment Persistence
* **Container Storage:** Uploaded attachments are written directly to the host container folder. In containerized environments, these must be mounted to persistent volumes or migrated to S3 to survive container recreations.

### 4. Role Integrity
* **RBAC Constraints:** Active roles cannot be deleted if they still have users associated with them.
