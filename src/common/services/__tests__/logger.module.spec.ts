import { Test } from '@nestjs/testing';
import { LoggerModule } from '../logger.module';
import { LoggerService } from '../logger.service';
import { ExceptionLogService } from '../exception-log.service';
import { DynamicModule, Provider } from '@nestjs/common';
import { ExceptionLogModule } from '../exception-log.module';
import { MongooseModule } from '@nestjs/mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { ExceptionLog } from '../../schemas/exception-log.schema';

// Mock LoggerService
jest.mock('../logger.service', () => {
  const original = jest.requireActual('../logger.service');
  return {
    ...original,
    LoggerService: jest
      .fn()
      .mockImplementation((exceptionLogService, name) => ({
        loggerName: name,
        exceptionLogService,
        setLoggerName: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        fatal: jest.fn(),
      })),
  };
});

// Mock MongooseModule to avoid real database connections
jest.mock('@nestjs/mongoose', () => {
  const original = jest.requireActual('@nestjs/mongoose');
  return {
    ...original,
    MongooseModule: {
      ...original.MongooseModule,
      forFeature: jest.fn().mockImplementation(() => ({
        module: class MockMongooseFeatureModule {},
        providers: [],
        exports: [],
      })),
    },
    getModelToken: jest
      .fn()
      .mockImplementation((modelName) => `${modelName}Model`),
  };
});

// Mock ExceptionLogModule
jest.mock('../exception-log.module', () => ({
  ExceptionLogModule: class MockExceptionLogModule {},
}));

// Helper type for provider with useFactory
interface FactoryProvider {
  provide: string | symbol;
  useFactory: (...args: any[]) => any;
  inject?: any[];
}

describe('LoggerModule', () => {
  // Mock ExceptionLogService
  const mockExceptionLogService = {
    saveLog: jest.fn(),
    exceptionModel: {
      create: jest.fn().mockResolvedValue({}),
    },
  } as unknown as ExceptionLogService;

  // Create module and global providers for all tests
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [LoggerModule],
      providers: [
        {
          provide: ExceptionLogService,
          useValue: mockExceptionLogService,
        },
      ],
    }).compile();

    expect(module).toBeDefined();
  });

  it('should register a LoggerService with custom name and token', () => {
    const TOKEN = 'TEST_LOGGER';
    const NAME = 'TestLogger';

    // Create the dynamic module
    const dynamicModule = LoggerModule.register(NAME, TOKEN);

    // Find the provider with our token
    const provider = dynamicModule.providers?.find(
      (p) => typeof p === 'object' && 'provide' in p && p.provide === TOKEN
    ) as FactoryProvider;

    // Get the factory function
    const factory = provider.useFactory;

    // Call the factory with our mock service
    const loggerInstance = factory(mockExceptionLogService);

    // Verify the logger was created with the right name
    expect(loggerInstance.loggerName).toBe(NAME);
  });

  it('should create a dynamic module with register method', () => {
    const TOKEN = 'TEST_LOGGER';
    const NAME = 'TestLogger';

    const dynamicModule = LoggerModule.register(NAME, TOKEN);

    expect(dynamicModule).toBeDefined();
    expect(dynamicModule.module).toBe(LoggerModule);
    expect(dynamicModule.providers).toBeDefined();
    expect(Array.isArray(dynamicModule.providers)).toBe(true);
    expect(dynamicModule.exports).toContain(TOKEN);
  });

  it('should export the registered logger service', () => {
    const TOKEN = 'APP_LOGGER';
    const registerModule = LoggerModule.register('AppLogger', TOKEN);

    const exports = registerModule.exports;
    expect(exports).toContain(TOKEN);
  });

  it('should have the correct module structure', () => {
    const TOKEN = 'STRUCTURE_TEST';
    const registerModule = LoggerModule.register('StructureTest', TOKEN);

    expect(registerModule.module).toBe(LoggerModule);
    expect(registerModule.providers).toBeDefined();

    if (registerModule.providers) {
      expect(registerModule.providers.length).toBeGreaterThanOrEqual(1);

      const provider = registerModule.providers.find(
        (p) => typeof p === 'object' && 'provide' in p && p.provide === TOKEN
      ) as FactoryProvider;

      expect(provider).toBeDefined();
      expect(provider.provide).toBe(TOKEN);
      expect(typeof provider.useFactory).toBe('function');
    }
  });

  it('should include ExceptionLogService in the factory dependencies', () => {
    const TOKEN = 'FACTORY_TEST';
    const NAME = 'FactoryTest';
    const registerModule = LoggerModule.register(NAME, TOKEN);

    if (registerModule.providers) {
      const provider = registerModule.providers.find(
        (p) => typeof p === 'object' && 'provide' in p && p.provide === TOKEN
      ) as FactoryProvider;

      expect(provider).toBeDefined();
      expect(provider.inject).toContain(ExceptionLogService);
    }
  });

  // Test that the module creates multiple unique loggers with different names
  it('should create unique loggers with different names', () => {
    const TOKEN1 = 'LOGGER_ONE';
    const NAME1 = 'LoggerOne';
    const TOKEN2 = 'LOGGER_TWO';
    const NAME2 = 'LoggerTwo';

    // Create two dynamic modules
    const module1 = LoggerModule.register(NAME1, TOKEN1);
    const module2 = LoggerModule.register(NAME2, TOKEN2);

    // Find the providers
    const provider1 = module1.providers?.find(
      (p) => typeof p === 'object' && 'provide' in p && p.provide === TOKEN1
    ) as FactoryProvider;

    const provider2 = module2.providers?.find(
      (p) => typeof p === 'object' && 'provide' in p && p.provide === TOKEN2
    ) as FactoryProvider;

    // Create instances
    const logger1 = provider1.useFactory(mockExceptionLogService);
    const logger2 = provider2.useFactory(mockExceptionLogService);

    // Verify the loggers have different names
    expect(logger1.loggerName).toBe(NAME1);
    expect(logger2.loggerName).toBe(NAME2);
    expect(logger1.loggerName).not.toBe(logger2.loggerName);
  });
});
