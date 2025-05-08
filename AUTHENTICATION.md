# Authentication Strategy

This document outlines the authentication strategy used in the NestJS Backend Boilerplate, including JWT, refresh tokens, cookies, middleware, and best practices.

## JWT Authentication

- **JWT (JSON Web Tokens)** are used for stateless authentication. Tokens are issued upon successful login and must be included in the `Authorization` header of subsequent requests.

  ```http
  Authorization: Bearer <token>
  ```

- **Token Generation**: Tokens are generated using a secret key defined in the `.env` file. Ensure this key is kept secure.

## Refresh Tokens

- **Purpose**: Refresh tokens are used to obtain new access tokens without requiring the user to log in again.
- **Storage**: Store refresh tokens securely, typically in an HTTP-only cookie to prevent XSS attacks.

## Middleware

- **Authentication Middleware**: Use middleware to extract and verify JWTs from incoming requests. This ensures that only authenticated users can access protected routes.

  ```typescript
  import { Injectable, NestMiddleware } from '@nestjs/common';
  import { Request, Response, NextFunction } from 'express';

  @Injectable()
  export class AuthMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
      // Extract and verify JWT
      next();
    }
  }
  ```

## Best Practices

- **Secure Storage**: Always store tokens securely, using HTTP-only cookies or secure storage mechanisms.
- **Token Expiry**: Set appropriate expiry times for access and refresh tokens to balance security and usability.
- **Revocation**: Implement token revocation mechanisms to invalidate tokens when necessary (e.g., user logout).
- **HTTPS**: Always use HTTPS to encrypt data in transit, including tokens.

## Conclusion

The authentication strategy in this boilerplate provides a robust and secure method for managing user sessions. By following these guidelines and best practices, you can ensure secure and efficient authentication in your applications.
