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

```

```
