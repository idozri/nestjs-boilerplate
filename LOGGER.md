# Logger Service

This document provides an overview of the `LoggerService` used in the NestJS Backend Boilerplate, including its usage, severity levels, and how to extend it.

## LoggerService Usage

The `LoggerService` is used to log messages with different severity levels throughout the application. It helps in tracking application behavior and diagnosing issues.

### Basic Usage

- Import and inject the `LoggerService` into your classes:

  ```typescript
  import { Injectable, Logger } from '@nestjs/common';

  @Injectable()
  export class ExampleService {
    private readonly logger = new Logger(ExampleService.name);

    someMethod() {
      this.logger.log('This is a log message');
    }
  }
  ```

## Severity Levels

The `LoggerService` supports the following severity levels:

- **Log**: General information about application operation.
- **Error**: Error messages indicating a failure in the application.
- **Warn**: Warning messages about potential issues.
- **Debug**: Detailed information for debugging purposes.
- **Verbose**: Highly detailed information, typically used for tracing.

## Extending LoggerService

To extend the `LoggerService`, you can create a custom logger by extending the base `Logger` class:

```typescript
import { Logger } from '@nestjs/common';

export class CustomLogger extends Logger {
  log(message: string) {
    // Custom log logic
    super.log(message);
  }
}
```

## Conclusion

The `LoggerService` is a powerful tool for monitoring and debugging your application. By understanding its usage and severity levels, you can effectively track application behavior and diagnose issues. Extend the service as needed to fit your specific logging requirements.
