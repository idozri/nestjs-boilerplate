# Environment Variables

This document lists all the environment variables used in the NestJS Backend Boilerplate, along with their descriptions and an example `.env` file.

## Environment Variables

- **`NODE_ENV`**: Specifies the environment in which the application is running (e.g., `development`, `production`).
- **`PORT`**: The port on which the application will run.
- **`JWT_SECRET`**: Secret key used for signing JWT tokens. Keep this value secure.
- **`DATABASE_URL`**: Connection string for the database.
- **`ENABLE_TELEGRAM_ALERTS`**: Toggle for enabling Telegram alerts (`true` or `false`).
- **`ENABLE_EMAIL_ALERTS`**: Toggle for enabling Email alerts (`true` or `false`).
- **`ENABLE_SENTRY`**: Toggle for enabling Sentry monitoring (`true` or `false`).
- **`ENABLE_RBAC`**: Toggle for enabling Role-Based Access Control (`true` or `false`).

## Example .env File

```env
NODE_ENV=development
PORT=3033
JWT_SECRET=your_jwt_secret
DATABASE_URL=postgres://user:password@localhost:5432/dbname
ENABLE_TELEGRAM_ALERTS=false
ENABLE_EMAIL_ALERTS=false
ENABLE_SENTRY=false
ENABLE_RBAC=true
```

## Conclusion

Ensure that all environment variables are correctly set before running the application. Use the example `.env` file as a template and adjust the values according to your environment and security requirements.
