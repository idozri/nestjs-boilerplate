# 🚀 NestJS Backend Boilerplate

This is a **production-ready NestJS boilerplate** for building secure, scalable, and well-documented backend APIs. It is designed to support fast project setup, modular architecture, and high maintainability out of the box.

---

## ✨ Features

- 🔐 JWT-based authentication
- 🧩 Modular architecture with optional features
- 🚨 Alerting via Telegram, Email, and Sentry (toggleable)
- 📦 Docker support for local/prod environments
- 🧪 Unit-tested services and guards
- 🧼 ESLint + Prettier for code quality
- 🔎 Swagger API documentation

### Toggleable Features

| Feature           | Toggle in `.env`              |
| ----------------- | ----------------------------- |
| Telegram Alerts   | `ENABLE_TELEGRAM_ALERTS=true` |
| Email Alerts      | `ENABLE_EMAIL_ALERTS=true`    |
| Sentry Monitoring | `ENABLE_SENTRY=true`          |
| Role-based Access | `ENABLE_RBAC=true`            |
| Swagger Docs      | Always enabled                |

---

## 🛠️ Getting Started

```bash
git clone <repo-url>
cd nestjs-backend-boilerplate
cp .env.example .env
npm install
npm run start:dev
```

---

## 📂 Recommended Structure

```
src/
├── auth/             # Authentication (JWT, guards, strategies)
├── common/           # Global DTOs, filters, exceptions, logging
├── config/           # Config service & env validation
├── rbac/             # Role-based access control (optional)
├── app.module.ts     # Application root module
└── main.ts           # Bootstrap logic
```

---

## 🔎 API Documentation

Swagger is available at:

```
http://localhost:3033/api/docs
```

Use this interface to explore and test the API endpoints.

---

## 🧪 Testing

```bash
npm run test
```

Includes:

- ✅ Happy path tests
- ✅ Edge case validation
- ✅ Failure scenarios

---

## 🧰 Scripts

```bash
npm run update:deps    # Updates core dependencies to latest versions
```

---

## 📚 Developer Docs

- [`PLANNING.md`](./PLANNING.md) – Boilerplate goals, architecture, and structure
- [`TASKS.md`](./TASKS.md) – Work log and feature tracking
- [`docs/API_RESPONSE_STANDARD.md`](./docs/API_RESPONSE_STANDARD.md)
- [`docs/ALERTING_AND_EXCEPTION_HANDLING.md`](./docs/ALERTING_AND_EXCEPTION_HANDLING.md)

---

## 🚀 CLI (Coming Soon)

You will be able to scaffold new projects with:

```bash
npx create-nestjs-backend my-app
```

Supports feature selection via prompts.

---

## ✅ Build fast. Scale safely. Deploy with confidence.

## Setup CLI Script

To set up the project environment, you can use the provided setup CLI script. This script will install all necessary dependencies and perform initial setup tasks.

### Usage

1. Ensure you have Node.js and npm installed on your system.
2. Navigate to the project root directory.
3. Run the setup script using the following command:

   ```bash
   ts-node scripts/setup-cli.ts
   ```

This will execute the setup process, installing dependencies and preparing the project for development.

## RBAC Guard

The RBAC (Role-Based Access Control) guard is used to manage access to routes based on user roles. It checks if the user has the required role to access a specific route.

### Usage

To use the RBAC guard, annotate your route handlers with the `@Roles` decorator, specifying the roles that are allowed to access the route.

```typescript
import { Controller, Get } from '@nestjs/common';
import { Roles } from './rbac/roles.decorator';

@Controller('example')
export class ExampleController {
  @Get()
  @Roles('admin')
  findAll() {
    return 'This route is restricted to admin users.';
  }
}
```

### Adding Roles Decorator

Create a `roles.decorator.ts` file in the `rbac` directory to define the `@Roles` decorator:

```typescript
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

```

```
