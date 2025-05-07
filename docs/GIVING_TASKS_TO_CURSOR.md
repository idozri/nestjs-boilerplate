# ✅ GIVING_TASKS_TO_CURSOR.md

This guide explains how to assign effective, error-proof tasks to Cursor AI during development of this NestJS boilerplate.

---

## 💡 Core Principles

- Always reference real file paths and goals
- Explain the **why**, not just the **what**
- Include expected output or behavior
- Require documentation and tests for every change
- Break tasks into steps that Cursor can follow linearly

---

## 🧪 Example Tasks

### 1. Add Swagger Annotations

```md
Task: Annotate all public methods in `AuthController` using Swagger decorators.

Files:
- src/auth/auth.controller.ts

Details:
- Add `@ApiTags`, `@ApiOperation`, `@ApiResponse` to each route
- Example success and error responses
- Confirm Swagger UI renders correctly at `/api`
```

### 2. Implement Email Alerts

```md
Task: Add optional email alerts feature

Steps:
1. Create `EmailService` under `src/common/services/`
2. Add `.env` vars: `SMTP_URL`, `EMAIL_FROM`, `ENABLE_EMAIL_ALERTS`
3. Create `sendEmailAlert()` helper
4. Trigger on exceptions in `AllExceptionsFilter`
5. Write unit tests
6. Document in `README.md` and `SYSTEM_DESIGN.md`
```

### 3. Create a new guard (RBAC)

```md
Task: Add role-based access control (RBAC)

Steps:
1. Add `RolesGuard` to `src/common/guards/`
2. Add roles enum and decorator in `common/enums/` and `common/decorators/`
3. Update `.env` with toggle `ENABLE_RBAC`
4. Add example usage in a protected route
5. Add tests to validate access control
6. Document in `README.md`
```

---

## ✅ Reminders for All Tasks

- 📄 Reference real files
- 🔍 Explain intent
- ✅ Include success/failure/edge case tests
- 🧭 Add docs to `README.md`, `TASKS.md`, or relevant spec

---

> Cursor, your job is to complete every task fully and clearly — **no shortcuts**, no assumptions. If context is missing, always ask.