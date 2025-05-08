import { Test } from '@nestjs/testing';
import { DatabaseModule } from '../database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Mock MongooseModule to avoid real database connections
jest.mock('@nestjs/mongoose', () => {
  const original = jest.requireActual('@nestjs/mongoose');
  return {
    ...original,
    MongooseModule: {
      ...original.MongooseModule,
      forRootAsync: jest.fn().mockImplementation(() => ({
        module: class MockMongooseRootModule {},
        providers: [],
        exports: [],
      })),
    },
  };
});

describe('DatabaseModule', () => {
  it('should compile the module', async () => {
    // Create a test module with mocked dependencies
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        DatabaseModule,
      ],
    }).compile();

    expect(module).toBeDefined();
  });

  it('should use correct MongoDB URI from config', () => {
    // Create mock config service
    const mockConfigService = {
      get: jest.fn().mockReturnValue('mongodb://test-uri'),
    };

    // Get the module definition
    const imports = Reflect.getMetadata('imports', DatabaseModule);

    // Find the MongooseModule.forRootAsync call and its config
    const asyncConfig = imports.find(
      (imp) =>
        typeof imp === 'function' && imp.toString().includes('forRootAsync')
    );

    // Extract and verify the factory function
    const factoryFn = (MongooseModule.forRootAsync as jest.Mock).mock
      .calls[0][0].useFactory;

    // Call the factory directly with our mock config service
    const result = factoryFn(mockConfigService);

    // Verify correct URI is used
    expect(result.uri).toBe('mongodb://test-uri');
    expect(mockConfigService.get).toHaveBeenCalledWith('MONGODB_URI');
  });

  it('should test useFactory in MongooseModule.forRootAsync', () => {
    // Extract the metadata from the module
    const imports = Reflect.getMetadata('imports', DatabaseModule);

    // Find the forRootAsync configuration
    const asyncConfig = imports.find(
      (imp) =>
        typeof imp === 'function' && imp.toString().includes('forRootAsync')
    );

    // Extract factory function and inject options
    const factoryFn = (MongooseModule.forRootAsync as jest.Mock).mock
      .calls[0][0].useFactory;
    expect(factoryFn).toBeDefined();

    // Test the factory with a mock ConfigService
    const mockConfigService = {
      get: jest.fn().mockReturnValue('mongodb://test-db'),
    };
    const result = factoryFn(mockConfigService);

    // Check the result has the right shape
    expect(result).toHaveProperty('uri');
    expect(result.uri).toBe('mongodb://test-db');
    expect(mockConfigService.get).toHaveBeenCalledWith('MONGODB_URI');
  });
});
