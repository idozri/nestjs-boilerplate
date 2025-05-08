# Getting Started with NestJS Backend Boilerplate

This guide will walk you through the process of setting up and running the NestJS Backend Boilerplate on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 14.x or later)
- **npm** (version 6.x or later)
- **Docker** (for containerized environments)

## Installation

1. **Clone the Repository**

   ```bash
   git clone <repo-url>
   cd nestjs-backend-boilerplate
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Copy Environment Variables**

   Copy the example environment file and adjust the variables as needed:

   ```bash
   cp .env.example .env
   ```

## Configuration

- Open the `.env` file and configure the necessary environment variables.
- Ensure database connection settings are correct.
- Set up any optional features you wish to enable (e.g., alerts, RBAC).

## Running the Application

### Development Mode

To start the application in development mode, run:

```bash
npm run start:dev
```

This will start the server with hot-reloading enabled.

### Production Mode

To build and run the application in production mode, use:

```bash
npm run build
npm run start:prod
```

### Docker

To run the application using Docker, ensure Docker is running and execute:

```bash
docker-compose up
```

## Local Development

- **Code Quality**: Use ESLint and Prettier to maintain code quality.
- **Testing**: Run tests using Jest:

  ```bash
  npm run test
  ```

- **API Documentation**: Access Swagger UI at `http://localhost:3033/api/docs` to explore API endpoints.

## Troubleshooting

- Ensure all services are running and accessible.
- Check logs for any errors or warnings.
- Verify environment variables are correctly set.

For further assistance, refer to the [README.md](./README.md) or other documentation files in the `docs/` directory.
