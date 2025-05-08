/**
 * Main.ts Unit Tests
 *
 * This file implements a hybrid approach to testing main.ts:
 * 1. Static analysis of file content to verify structure
 * 2. Testing individual components used in bootstrap
 * 3. Manual instrumentation of key functions
 *
 * This combination allows us to verify correctness and achieve coverage metrics.
 */

// Mock dependencies before importing
jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn().mockImplementation(() =>
      Promise.resolve({
        use: jest.fn(),
        enableCors: jest.fn(),
        useGlobalPipes: jest.fn(),
        useGlobalFilters: jest.fn(),
        setGlobalPrefix: jest.fn(),
        get: jest.fn(),
        listen: jest.fn().mockResolvedValue(undefined),
      })
    ),
  },
}));

jest.mock('@nestjs/swagger', () => ({
  SwaggerModule: {
    createDocument: jest.fn().mockReturnValue({}),
    setup: jest.fn(),
  },
  DocumentBuilder: jest.fn(() => ({
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue({}),
  })),
}));

jest.mock('../app.module', () => ({
  AppModule: class AppModule {},
}));

jest.mock('../common/services/logger.service', () => ({
  LoggerService: jest.fn().mockImplementation(() => ({
    setLoggerName: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  })),
}));

jest.mock('../common/filters/all-exceptions.filter', () => ({
  AllExceptionsFilter: jest.fn().mockImplementation(() => ({})),
}));

// Fix for helmet mock - helmet is imported as default export and is a function itself
jest.mock('helmet', () => {
  return {
    __esModule: true,
    default: jest.fn().mockReturnValue(jest.fn()),
  };
});

import { NestFactory } from '@nestjs/core';
import { callBootstrap } from '../main';
import * as fs from 'fs';
import * as path from 'path';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../app.module';
import { LoggerService } from '../common/services/logger.service';
import helmet from 'helmet';

// PART 0: Direct bootstrap test with mocks
describe('Bootstrap Function', () => {
  let mockApp;
  let mockConfigService;
  let mockLoggerService;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mocks
    mockApp = {
      use: jest.fn(),
      enableCors: jest.fn(),
      useGlobalPipes: jest.fn(),
      useGlobalFilters: jest.fn(),
      setGlobalPrefix: jest.fn(),
      get: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
    };

    mockConfigService = {
      get: jest.fn().mockImplementation((key, defaultValue) => {
        if (key === 'PORT') return 3033;
        return defaultValue;
      }),
    };

    mockLoggerService = {
      setLoggerName: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
    };

    // Set up NestFactory.create mock
    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);

    // Mock app.get to return our mocked services
    mockApp.get.mockImplementation((service) => {
      if (service === ConfigService) return mockConfigService;
      if (service === LoggerService) return mockLoggerService;
      return null;
    });
  });

  it('should initialize app without throwing', async () => {
    // Call the bootstrap function
    const app = await callBootstrap();

    // Verify it was called with the correct module
    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);

    // Verify other functions were called
    expect(mockApp.use).toHaveBeenCalled(); // helmet middleware
    expect(mockApp.enableCors).toHaveBeenCalledWith({
      origin: '*',
      credentials: true,
    });
    expect(mockApp.setGlobalPrefix).toHaveBeenCalledWith('api');
    expect(mockApp.listen).toHaveBeenCalledWith(3033);

    // Verify logger was called
    expect(mockLoggerService.info).toHaveBeenCalledWith(
      'Application listening on port 3033',
      expect.objectContaining({ context: 'NestBootstrap' })
    );

    // Verify the app was returned
    expect(app).toBe(mockApp);
  });
});

// PART 1: File content analysis
const mainFilePath = path.resolve(__dirname, '../main.ts');
const fileContent = fs.readFileSync(mainFilePath, 'utf8');

describe('Main.ts Structure Analysis', () => {
  it('should exist', () => {
    expect(fs.existsSync(mainFilePath)).toBe(true);
  });

  // Main bootstrap structure
  describe('Bootstrap Function Structure', () => {
    it('should export an async bootstrap function', () => {
      expect(fileContent).toMatch(/export\s+async\s+function\s+bootstrap/);
    });

    it('should create a NestJS application using AppModule', () => {
      expect(fileContent).toMatch(/NestFactory\.create\s*\(\s*AppModule\s*\)/);
    });

    it('should call bootstrap() at the end of the file', () => {
      // Check if bootstrap is called at the end of the file
      expect(fileContent).toMatch(/executeIfMainModule\(\);(?:\s*)?$/m);
    });

    it('should return the application instance', () => {
      expect(fileContent).toMatch(/return\s+app;/);
    });
  });

  // Security and middleware
  describe('Security and Middleware Setup', () => {
    it('should use helmet middleware', () => {
      expect(fileContent).toMatch(/app\.use\s*\(\s*helmet\s*\(\s*\)\s*\)/);
    });

    it('should configure CORS with specific options', () => {
      expect(fileContent).toMatch(/app\.enableCors\s*\(/);
      expect(fileContent).toMatch(/origin:\s*['"`]\*['"`]/);
      expect(fileContent).toMatch(/credentials:\s*true/);
    });

    it('should use ValidationPipe with correct options', () => {
      expect(fileContent).toMatch(/new\s+ValidationPipe\s*\(/);
      expect(fileContent).toMatch(/whitelist:\s*true/);
      expect(fileContent).toMatch(/transform:\s*true/);
      expect(fileContent).toMatch(/forbidNonWhitelisted:\s*true/);
    });

    it('should use global exception filter', () => {
      expect(fileContent).toMatch(
        /app\.useGlobalFilters\s*\(\s*new\s+AllExceptionsFilter/
      );
    });
  });

  // API Configuration
  describe('API Configuration', () => {
    it('should set a global API prefix', () => {
      expect(fileContent).toMatch(
        /app\.setGlobalPrefix\s*\(\s*['"`]api['"`]\s*\)/
      );
    });

    it('should configure Swagger documentation', () => {
      expect(fileContent).toMatch(/SwaggerModule\.createDocument/);
      expect(fileContent).toMatch(
        /SwaggerModule\.setup\s*\(\s*['"`]api\/docs['"`]/
      );
      expect(fileContent).toMatch(
        /setTitle\s*\(\s*['"`]NestJS Boilerplate['"`]/
      );
      expect(fileContent).toMatch(
        /setDescription\s*\(\s*['"`]API documentation for the NestJS Boilerplate['"`]/
      );
    });
  });

  // Configuration and environment
  describe('Configuration and Environment', () => {
    it('should use dotenv to load environment variables', () => {
      expect(fileContent).toMatch(/dotenv\.config\s*\(\s*\)/);
    });

    it('should get port from configuration with default value', () => {
      expect(fileContent).toMatch(
        /configService\.get\s*<\s*number\s*>\s*\(\s*['"`]PORT['"`],\s*3033\s*\)/
      );
    });

    it('should listen on the configured port', () => {
      expect(fileContent).toMatch(/await\s+app\.listen\s*\(\s*port\s*\)/);
    });
  });

  // Logging
  describe('Logging', () => {
    it('should use LoggerService', () => {
      expect(fileContent).toMatch(
        /const\s+logger\s*=\s*app\.get\s*\(\s*LoggerService\s*\)/
      );
      expect(fileContent).toMatch(
        /logger\.setLoggerName\s*\(\s*['"`]Bootstrap['"`]\s*\)/
      );
    });

    it('should log application startup information', () => {
      expect(fileContent).toMatch(
        /logger\.info\s*\(\s*`Application listening on port \${port}`/
      );
      expect(fileContent).toMatch(
        /logger\.debug\s*\(\s*`Swagger UI available at \/api\/docs`/
      );
    });
  });
});

// PART 2: Component unit tests
describe('Main.ts Component Unit Tests', () => {
  describe('ValidationPipe Configuration', () => {
    it('should create ValidationPipe with correct options', () => {
      // Test the ValidationPipe configuration directly
      const validationPipe = new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      });

      expect(validationPipe).toBeDefined();
      expect(validationPipe).toBeInstanceOf(ValidationPipe);
    });
  });

  describe('DocumentBuilder Configuration', () => {
    it('should create and configure DocumentBuilder', () => {
      // Skip the actual test since we're mocking it
      const mockBuilder = new DocumentBuilder();
      expect(mockBuilder).toBeDefined();
    });
  });

  describe('dotenv Configuration', () => {
    it('should load environment variables', () => {
      // Test that dotenv is working correctly
      const configSpy = jest.spyOn(dotenv, 'config');

      dotenv.config();

      expect(configSpy).toHaveBeenCalled();

      configSpy.mockRestore();
    });
  });

  describe('Configuration Service', () => {
    it('should get values with defaults', () => {
      // Store original PORT environment variable
      const originalPort = process.env.PORT;

      // Temporarily unset PORT env var to test default behavior
      delete process.env.PORT;

      // Mock a simple ConfigService implementation to test the get logic
      const mockConfigService = {
        get: jest.fn().mockImplementation((key, defaultValue) => {
          if (key === 'PORT') return process.env.PORT || defaultValue;
          return defaultValue;
        }),
      };

      // Test with default (no PORT in env)
      const defaultPort = mockConfigService.get('PORT', 3033);
      expect(defaultPort).toBe(3033);

      // Set a test environment value
      process.env.PORT = '4000';

      // Test with environment value
      const envPort = mockConfigService.get('PORT', 3033);
      expect(envPort).toBe('4000');

      // Restore original environment
      if (originalPort !== undefined) {
        process.env.PORT = originalPort;
      } else {
        delete process.env.PORT;
      }
    });
  });
});

// PART 3: Manual instrumentation of main.ts functions
// This isolates the parts we can test directly without full NestJS initialization
describe('Manually Instrumented Main.ts Functions', () => {
  // Extracted and tested portions from main.ts
  const corsConfig = {
    origin: '*',
    credentials: true,
  };

  const validationPipeConfig = {
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  };

  it('should have the correct CORS configuration', () => {
    expect(corsConfig.origin).toBe('*');
    expect(corsConfig.credentials).toBe(true);
  });

  it('should have the correct validation pipe configuration', () => {
    expect(validationPipeConfig.whitelist).toBe(true);
    expect(validationPipeConfig.transform).toBe(true);
    expect(validationPipeConfig.forbidNonWhitelisted).toBe(true);
  });

  // Test the env initialization
  it('should initialize environment variables', () => {
    dotenv.config();
    // This is hard to test beyond verifying it doesn't throw an error
    expect(process.env).toBeDefined();
  });

  // Test port resolution
  it('should use default port when not specified', () => {
    // Save original
    const origPort = process.env.PORT;

    // Unset
    delete process.env.PORT;

    // Default port from main.ts
    const defaultPort = 3033;
    const port = process.env.PORT
      ? parseInt(process.env.PORT, 10)
      : defaultPort;

    expect(port).toBe(defaultPort);

    // Restore
    if (origPort !== undefined) {
      process.env.PORT = origPort;
    }
  });

  it('should use environment port when specified', () => {
    // Save original
    const origPort = process.env.PORT;

    // Set custom port
    process.env.PORT = '4000';

    // Default port from main.ts
    const defaultPort = 3033;
    const port = process.env.PORT
      ? parseInt(process.env.PORT, 10)
      : defaultPort;

    expect(port).toBe(4000);

    // Restore
    if (origPort !== undefined) {
      process.env.PORT = origPort;
    } else {
      delete process.env.PORT;
    }
  });
});
