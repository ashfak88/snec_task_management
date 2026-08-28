# System Architecture

## Architecture Diagram
```mermaid
graph TD
    Client[Next.js Frontend Client] --> API[NestJS Backend API]
    API --> Controller[Controllers]
    Controller --> Service[Services]
    Service --> Prisma[Prisma ORM]
    Prisma --> DB[(PostgreSQL)]
    
    subgraph Frontend Features
    AuthUI[Authentication UI]
    SettingsUI[Settings & Permissions Matrix]
    DashboardUI[Dashboard & Reports]
    AuditUI[Audit Logs Table]
    Kanban[Project/Task Kanban]
    end

    subgraph Backend Modules
    AuthModule[Auth Module]
    UserModule[Users Module]
    RoleModule[Roles & Permissions Module]
    ProjectModule[Projects Module]
    TaskModule[Tasks & Comments Module]
    AuditModule[Audit Logs Module]
    ReportModule[Reports Module]
    end
    
    Controller -- Uses --> AuthGuard[JWT Auth Guard]
    Controller -- Uses --> PermGuard[Permissions Guard]
    Controller -- Uses --> RateLimit[Throttler Guard]
    Controller -- Intercepted by --> AuditInterceptor[Global Audit Interceptor]
```

## Design Details
- **Frontend Client:** Built as a Single Page Application (SPA) using Next.js (App Router). Global application state is managed using `Zustand` and server-state/caching is handled with `TanStack Query`. Component styling is implemented via Tailwind CSS.
- **Backend API:** Monolithic structure designed with NestJS modules to enforce separation of concerns. Prisma ORM is used for database modeling and query execution.
- **Cross-Cutting Concerns:** 
  - Rate limiting is handled on the API gateway/controller level via `@nestjs/throttler`.
  - Auditing is implemented asynchronously through a global `AuditInterceptor` that catches write mutations (`POST`, `PUT`, `PATCH`, `DELETE`) and registers logs.
