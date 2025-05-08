# API Guidelines

This document provides guidelines for writing new API routes, including request validation, response formats, DTOs, and error handling in the NestJS Backend Boilerplate.

## Writing New Routes

1. **Define a Controller**: Create a new controller file in the appropriate module directory. Use decorators like `@Controller()` and `@Get()`, `@Post()`, etc., to define routes.

   ```typescript
   import { Controller, Get } from '@nestjs/common';

   @Controller('example')
   export class ExampleController {
     @Get()
     findAll() {
       return 'This is an example route.';
     }
   }
   ```

2. **Use Services**: Delegate business logic to services. Inject services into controllers using NestJS's DI system.

   ```typescript
   import { Injectable } from '@nestjs/common';

   @Injectable()
   export class ExampleService {
     getData() {
       return 'Service data';
     }
   }
   ```

## Request Validation

- Use DTOs (Data Transfer Objects) to validate incoming requests. Decorate DTO properties with validation decorators from `class-validator`.

  ```typescript
  import { IsString, IsInt } from 'class-validator';

  export class CreateExampleDto {
    @IsString()
    name: string;

    @IsInt()
    age: number;
  }
  ```

## Response Formats

- Use the `ApiResponseDto<T>` to standardize API responses. Ensure all responses conform to this format.

  ```typescript
  export class ApiResponseDto<T> {
    success: boolean;
    data: T;
    message?: string;
  }
  ```

## Error Handling

- Use the `AppException` class for structured error responses. Wrap logic in `try/catch` blocks where failures might occur.

  ```typescript
  import { HttpException, HttpStatus } from '@nestjs/common';

  export class AppException extends HttpException {
    constructor(message: string, status: HttpStatus) {
      super(message, status);
    }
  }
  ```

- Implement global exception filters to handle uncaught exceptions and return consistent error responses.

## Conclusion

Following these guidelines will help maintain consistency and reliability across the API. Ensure all new routes and features adhere to these standards to provide a robust and user-friendly API.
