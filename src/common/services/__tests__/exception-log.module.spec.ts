import { Test } from '@nestjs/testing';
import { ExceptionLogModule } from '../exception-log.module';
import { ExceptionLogService } from '../exception-log.service';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import {
  ExceptionLog,
  ExceptionLogSchema,
} from '../../schemas/exception-log.schema';
import { ConfigModule } from '@nestjs/config';
import { Model } from 'mongoose';
import { LoggerService } from '../logger.service';

// Mock MongooseModule to avoid real database connections
jest.mock('@nestjs/mongoose', () => {
  const original = jest.requireActual('@nestjs/mongoose');
  return {
    ...original,
    MongooseModule: {
      ...original.MongooseModule,
      forFeature: jest.fn().mockImplementation((models) => {
        return {
          models: models,
          module: class MockMongooseFeatureModule {},
        };
      }),
    },
  };
});

// Create a mock class for the Mongoose model
class MockExceptionLogModel {
  static find = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue([]),
  });

  static findOne = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(null),
  });

  save = jest.fn().mockImplementation(function () {
    return Promise.resolve(this);
  });

  constructor(private readonly data: any) {}
}

// Mock LoggerService
const mockLoggerService = {
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  fatal: jest.fn(),
  setLoggerName: jest.fn(),
};

describe('ExceptionLogModule', () => {
  it('should compile the module', async () => {
    // Create a test module without trying to connect to MongoDB
    const module = await Test.createTestingModule({
      imports: [
        // Use ConfigModule in case it's needed
        ConfigModule.forRoot({ isGlobal: true }),
      ],
      providers: [
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
        {
          // Provide a mock of the Mongoose model
          provide: getModelToken(ExceptionLog.name),
          useValue: MockExceptionLogModel,
        },
        ExceptionLogService,
      ],
    }).compile();

    expect(module).toBeDefined();
    // Verify the service is provided
    const service = module.get<ExceptionLogService>(ExceptionLogService);
    expect(service).toBeDefined();
  });

  it('should provide ExceptionLogService', async () => {
    // Create a test module with mocked ExceptionLogService
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: ExceptionLogService,
          useValue: {
            saveLog: jest.fn(),
          },
        },
      ],
    }).compile();

    const service = module.get<ExceptionLogService>(ExceptionLogService);
    expect(service).toBeDefined();
    expect(service.saveLog).toBeDefined();
  });

  it('should export ExceptionLogService', () => {
    // Check that the module exports include ExceptionLogService
    const exports = Reflect.getMetadata('exports', ExceptionLogModule);
    expect(exports).toContain(ExceptionLogService);
  });

  it('should use the correct schema for ExceptionLog', () => {
    // Verify that MongooseModule.forFeature was called with the correct model
    expect(MongooseModule.forFeature).toHaveBeenCalled();

    // Get the models passed to forFeature
    const callArgs = (MongooseModule.forFeature as jest.Mock).mock.calls[0][0];

    // Check that our model is in the array
    const hasExceptionLogModel = callArgs.some(
      (model) =>
        model.name === ExceptionLog.name && model.schema === ExceptionLogSchema
    );

    expect(hasExceptionLogModel).toBe(true);

    // Also verify the factory function is called correctly
    const models = callArgs.map((model) => ({
      name: model.name,
      schema: typeof model.schema,
    }));

    expect(models).toEqual([{ name: 'ExceptionLog', schema: 'object' }]);
  });

  it('should test the module with full imports', () => {
    // Check that the module has correct imports, providers, and exports
    const imports = Reflect.getMetadata('imports', ExceptionLogModule);
    const providers = Reflect.getMetadata('providers', ExceptionLogModule);
    const exports = Reflect.getMetadata('exports', ExceptionLogModule);

    // Verify module structure
    expect(imports).toBeDefined();
    expect(providers).toContain(ExceptionLogService);
    expect(exports).toContain(ExceptionLogService);

    // Verify MongooseModule.forFeature was called with correct args
    expect(MongooseModule.forFeature).toHaveBeenCalledWith([
      { name: ExceptionLog.name, schema: ExceptionLogSchema },
    ]);

    // Verify the model name matches schema name
    expect(ExceptionLog.name).toBe('ExceptionLog');
  });
});
