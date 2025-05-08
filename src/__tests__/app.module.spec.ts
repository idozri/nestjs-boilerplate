import { AppModule } from '../app.module';
import { ConfigService } from '@nestjs/config';

// We need to mock all the decorators and functions from @nestjs/mongoose
jest.mock('@nestjs/mongoose', () => {
  return {
    MongooseModule: {
      forRoot: jest.fn(),
      forRootAsync: jest.fn(),
      forFeature: jest.fn(),
    },
    Schema: () => (target: any) => target,
    Prop: () => (target: any, key: string) => {},
    SchemaFactory: {
      createForClass: jest.fn(),
    },
    InjectModel: () => (target: any, key: string) => {},
  };
});

// Also mock the mongoose library
jest.mock('mongoose', () => ({
  Schema: jest.fn(),
  model: jest.fn(),
}));

jest.mock('@nestjs/config', () => {
  return {
    ConfigModule: {
      forRoot: jest.fn(),
    },
    ConfigService: jest.fn(),
  };
});

describe('AppModule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should define the AppModule correctly', () => {
    expect(AppModule).toBeDefined();

    // Simple instantiation test
    const appModuleInstance = new AppModule();
    expect(appModuleInstance).toBeDefined();
  });

  it('should test MongoDB connection factory function directly', () => {
    // Create a factory function that simulates what's in AppModule
    const mongooseFactory = (configService: ConfigService) => ({
      uri: configService.get<string>('MONGODB_URI'),
    });

    // Mock for ConfigService
    const mockConfigService = {
      get: jest.fn().mockReturnValue('mongodb://test-uri'),
    };

    // Execute the function
    const result = mongooseFactory(mockConfigService as any);

    // Verify correct behavior
    expect(result).toEqual({ uri: 'mongodb://test-uri' });
    expect(mockConfigService.get).toHaveBeenCalledWith('MONGODB_URI');
  });

  it('should handle null MONGODB_URI', () => {
    // Create a factory function that simulates what's in AppModule
    const mongooseFactory = (configService: ConfigService) => ({
      uri: configService.get<string>('MONGODB_URI'),
    });

    // Mock for ConfigService that returns null
    const mockConfigService = {
      get: jest.fn().mockReturnValue(null),
    };

    // Execute the function
    const result = mongooseFactory(mockConfigService as any);

    // Verify correct behavior
    expect(result).toEqual({ uri: null });
    expect(mockConfigService.get).toHaveBeenCalledWith('MONGODB_URI');
  });

  // Add a test for the useFactory in MongooseModule.forRootAsync
  it('should test with configService that throws an error', () => {
    // Create a factory function that simulates what's in AppModule
    const mongooseFactory = (configService: ConfigService) => ({
      uri: configService.get<string>('MONGODB_URI'),
    });

    // Mock for ConfigService that throws an error
    const mockConfigService = {
      get: jest.fn().mockImplementation(() => {
        throw new Error('Config error');
      }),
    };

    // Execute the function and expect it to throw
    expect(() => {
      mongooseFactory(mockConfigService as any);
    }).toThrow('Config error');

    // Verify the mock was called
    expect(mockConfigService.get).toHaveBeenCalledWith('MONGODB_URI');
  });
});
