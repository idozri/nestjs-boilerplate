# 📁 CURSOR SETUP

This guide prepares Cursor AI to convert the existing NestJS backend into a reusable, feature-rich boilerplate project.

## 🧠 General Project Description

This is a modular, production-ready **NestJS boilerplate** focused on:

- Feature flags and toggles for optional modules (e.g., Telegram, Email, Alerts)
- API-first backend with Swagger docs
- Strict code quality, testing, logging, and alerting standards

The project was originally designed as a secure, production-ready NestJS backend, and is now being generalized into a boilerplate.

## 📄 Key Cursor Behavior

- Always begin work by reading `PLANNING.md`.
- Track task progress and completion in `TASKS.md`.
- Follow all rules defined in `.cursor/rules.mdc`.
- Always use centralized `ApiResponseDto`, `AppException`, and `AllExceptionsFilter`.
- When a feature is added, ensure it supports `.env` toggle-based activation.

## 📍 Save path: `docs/CURSOR_SETUP.md`

Cursor should start by reading this file.

Once ready, begin refactoring and setup work as defined in `TASKS.md`.
