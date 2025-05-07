# 🧠 PLANNING.md – NestJS Boilerplate

## Goals

- Modular NestJS server
- Feature-toggled architecture (Telegram, email, Sentry, etc.)
- Fully typed, tested, documented

## Structure

- `/common`: DTOs, filters, exceptions, logger, utils
- `/auth`: JWT login + token utils
- `/webhook`: Handles Green Invoice callbacks
- `/config`: Feature toggles and env configs

## Optional Features (Toggled via ENV)

- Alerts
- Email service
- Sentry
- Background workers
- RBAC roles

## Best Practices

- Try/catch all service logic
- Use AppException
- Use ApiResponseDto
- Telegram for exception alerts
- Swagger for API docs
