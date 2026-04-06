# Finance Dashboard Backend

A production-quality, role-based finance management API built with Node.js, TypeScript, Express, and PostgreSQL (Prisma ORM). This project demonstrates a robust 3-layer architecture with a focus on security, financial accuracy, and maintainability.

---

## 🏗️ Core Architecture

This project follows a **3-Layer Architecture** (Controller -> Service -> Repository) to ensure clear separation of concerns:

1.  **API Layer (Controllers & Routes)**: Handles HTTP requests, authentication, and response formatting.
2.  **Service Layer (Business Logic)**: The core of the application where business rules, calculations, and role-based strategies are enforced.
3.  **Data Access Layer (Repositories)**: Abstracts the database (Prisma) behind a generic repository pattern, making the data source replaceable.

### Design Patterns

- **Strategy Pattern (RBAC)**: Role permissions are encapsulated in strategy classes, making the permission matrix easy to extend without `if/else` bloat.
- **Dependency Injection**: Dependencies are injected via constructors, facilitating easier unit testing and mocking.
- **Singleton Pattern**: Ensures single instances of heavy resources like the Prisma Client and Logger.

---

## 🛠️ Tech Stack

| Asset          | Technology              | Rationale                                          |
| -------------- | ----------------------- | -------------------------------------------------- |
| **Runtime**    | Node.js 18+             | Robust, event-driven runtime.                      |
| **Language**   | TypeScript 5.x (Strict) | Superior type safety and developer productivity.   |
| **Framework**  | Express 4.x             | Minimalist and widely supported web framework.     |
| **Database**   | PostgreSQL 15+          | ACID-compliant relational DB for financial data.   |
| **ORM**        | Prisma 5.x              | Type-safe queries and automated migrations.        |
| **Validation** | Zod 3.x                 | Schema-first validation with runtime type safety.  |
| **Auth**       | JWT + bcryptjs          | Stateless session management and secure hashing.   |
| **Logging**    | Winston 3.x             | Structured JSON logging for production monitoring. |
| **Testing**    | Jest + Supertest        | Comprehensive unit and integration test framework. |

---

## 🚀 Setup & Installation

### Prerequisites

- Node.js 18+
- PostgreSQL (Neon.tech)
- _Optional_: Docker & Docker Compose

### Local Development Setup

1.  **Clone & Install**

    ```bash
    git clone <repository-url>
    cd finance-dashboard-backend
    npm install
    ```

2.  **Environment Configuration**

    ```bash
    cp .env.example .env
    # filling in DATABASE_URL and a secure JWT_SECRET (min 32 chars)
    ```

3.  **Database Bootstrapping**

    ```bash
    # Run migrations to create tables
    npm run db:migrate

    # Seed the database with test users and sample records
    npm run db:seed
    ```

4.  **Start the Application**

    ```bash
    npm run dev
    ```

    - API: `http://localhost:3000/api`
    - Swagger UI: `http://localhost:3000/api-docs`
    - Health Check: `http://localhost:3000/health`

### Docker Usage

```bash
docker-compose up --build
docker-compose exec app npm run db:migrate
docker-compose exec app npm run db:seed
```

---

## 🧪 Testing

The project maintains high coverage with both Unit and Integration tests.

```bash
npm test                  # Run all tests (Unit + Integration)
npm run test:unit         # Logic-only tests (no DB required)
npm run test:integration  # End-to-end API tests (requires DB)
```

_Note: Integration tests use the database configured in `.env`. Ensure your test DB is reachable._

---

## 🔑 Seed User Accounts

The `db:seed` script creates the following accounts for testing:

| Email                 | Password        | Role    | Access Level                        |
| --------------------- | --------------- | ------- | ----------------------------------- |
| `admin@finance.dev`   | `Admin@12345`   | ADMIN   | Full system access + User Mgmt      |
| `analyst@finance.dev` | `Analyst@12345` | ANALYST | Create/Edit own records + Dashboard |
| `viewer@finance.dev`  | `Viewer@12345`  | VIEWER  | Read-only Dashboard summary         |

---

## 📖 API Documentation

The full API specification is available via **Swagger/OpenAPI** at `/api-docs`.

### Response Envelopes

All API responses follow a consistent structure:

- **Success**: `{ "success": true, "data": { ... } }`
- **Error**: `{ "success": false, "error": { "code": "...", "message": "...", ... } }`

### Key Endpoints

- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`
- **Records**: `GET or POST /api/records`, `PATCH or DELETE /api/records/:id`
- **Dashboard**: `GET /api/dashboard/summary`, `/category-breakdown`, `/trends`, `/recent-activity`
- **Admin**: `GET /api/users`, `GET /api/audit-logs`

---

## ⚖️ Tradeoffs & Design Decisions

### **1. Financial Precision (Decimal vs. Number)**

We use `Decimal.js` (via Prisma's `Decimal` type) for all currency fields.

- **Why**: Standard JavaScript `number` (Float64) suffers from precision issues (e.g., `0.1 + 0.2 !== 0.3`). For a finance app, exact precision is non-negotiable.
- **Tradeoff**: Slightly more verbose arithmetic in the code.

### **2. Soft Delete vs. Hard Delete**

Records and Users use a soft-delete mechanism (`isDeleted` flag or `INACTIVE` status).

- **Why**: Preserves audit trails and allows for data recovery.
- **Tradeoff**: Increased storage over time and requirement to filter every query (handled at the Repository level).

### **3. JWT Stateless Auth vs. Sessions**

Auth is handled via signed JWTs.

- **Why**: Allows the API to scale horizontally without needing a shared session store (like Redis) initially.
- **Tradeoff**: Instant token revocation is harder. We mitigate this with a manageable TTL (7 days) and secondary status checks (ACTIVE/INACTIVE) in the middleware.

### **4. Strategy Pattern vs. Conditionals**

Role permissions are handled via the Strategy pattern.

- **Why**: Prevents "God objects" and massive switch statements in service logic. Adding a role is a matter of adding a new strategy class.
- **Tradeoff**: Introduces more classes and slightly higher initial complexity.

---

## 📝 Assumptions

1.  **VIEWER Promotion**: New users are assigned the `VIEWER` role by default. Only an existing `ADMIN` can promote them to `ANALYST` or `ADMIN` via the `/api/users` endpoint.
2.  **Audit Immutable**: Audit logs are append-only. There is NO endpoint to update or delete an audit log to maintain system integrity.
3.  **Active Status**: A user can have a valid JWT but still be blocked if an Admin sets their status to `INACTIVE` or `SUSPENDED`. This is checked on every authenticated request.
4.  **Soft-Delete Scoping**: Soft-deleted financial records are excluded from ALL calculations (General Summary, Trends, etc.) but remain in the DB and visible in `AuditLog` history.
5.  **Category Flexibility**: Categories are managed as strings in the DB to allow for future expansion without heavy migrations, though currently validated against a strict Enum at the API level.

---

## 📂 Project Structure

```bash
src/
 ├── entities/       # Domain Layer: Classes with business logic (User, Record)
 ├── repositories/   # Data Access: Logic-agnostic Prisma wrappers (BaseRepository)
 ├── services/       # Service Layer: Orchestrates business rules & RBAC strategies
 ├── controllers/    # API Layer: Handles HTTP requests, responses & status codes
 ├── middleware/     # Protection: JWT Auth, Permission gating, Zod validation
 ├── strategies/     # RBAC System: Strategy Pattern for role-based permissions
 ├── validators/     # Schemas: Zod definitions for payload & param enforcement
 ├── utils/          # Core Utils: Singleton Prisma client, Logger, Swagger config
 ├── exceptions/     # Error System: Custom exception hierarchy for API errors
 └── routes/         # Routing: Mounts controllers into the Express router tree
prisma/
  ├── schema.prisma      # Database: Schema definitions
  └── seed.ts            # Database: Seed scripts
tests/
  ├── unit/              # Unit tests: entities, strategies, validators
  ├── integration/       # Integration tests: auth, records, dashboard, rbac
  └── helpers/           # Test helpers: fixtures, test client
```
