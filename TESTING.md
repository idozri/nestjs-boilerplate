# Testing Guide

This document provides instructions on writing unit and integration tests for the NestJS Backend Boilerplate, including test structure and execution.

## Writing Tests

### Unit Tests

- **Purpose**: Unit tests are used to test individual components in isolation.
- **Structure**: Place unit tests in the `__tests__` directory within the corresponding module.

  ```typescript
  import { Test, TestingModule } from '@nestjs/testing';
  import { ExampleService } from './example.service';

  describe('ExampleService', () => {
    let service: ExampleService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [ExampleService],
      }).compile();

      service = module.get<ExampleService>(ExampleService);
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });
  ```

### Integration Tests

- **Purpose**: Integration tests are used to test the interaction between multiple components.
- **Structure**: Place integration tests in the `__tests__` directory within the corresponding module.

  ```typescript
  import { Test, TestingModule } from '@nestjs/testing';
  import { INestApplication } from '@nestjs/common';
  import * as request from 'supertest';
  import { AppModule } from '../src/app.module';

  describe('AppController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    it('/ (GET)', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });
  ```

## Running Tests

- Use the following command to run all tests:

  ```bash
  npm run test
  ```

- To run tests with coverage:

  ```bash
  npm run test:cov
  ```

## Conclusion

Testing is a crucial part of maintaining a reliable and robust application. By following these guidelines, you can ensure that your application is well-tested and ready for production.
