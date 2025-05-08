import { Test, TestingModule } from '@nestjs/testing';
import { ExceptionLogService } from '../exception-log.service';
import { getModelToken } from '@nestjs/mongoose';
import { ExceptionLog } from '../../schemas/exception-log.schema';
import { LoggerService } from '../logger.service';
import { ErrorSeverity } from '../../enums/error-severity.enum';

// Mock MongoDB model functions
const mockModel = {
  create: jest.fn().mockImplementation((data) => Promise.resolve(data)),
};

// Mock LoggerService
const mockLoggerService = {
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  fatal: jest.fn(),
  setLoggerName: jest.fn(),
};

describe('ExceptionLogService', () => {
  let service: ExceptionLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
        {
          provide: getModelToken(ExceptionLog.name),
          useValue: mockModel,
        },
        ExceptionLogService,
      ],
    }).compile();

    service = module.get<ExceptionLogService>(ExceptionLogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // SUCCESS CASE
  it('should save log successfully', async () => {
    const logData = {
      message: 'Test error message',
      context: 'TestContext',
      severity: ErrorSeverity.ERROR,
      metadata: { userId: '123', endpoint: '/test' },
    };

    await service.saveLog(logData);

    expect(mockModel.create).toHaveBeenCalledWith(logData);
  });

  // FAILURE CASE
  it('should handle database errors when saving logs', async () => {
    // Mock a failure
    mockModel.create.mockRejectedValueOnce(
      new Error('Database connection failed')
    );

    const logData = {
      message: 'Test error message',
      context: 'TestContext',
      severity: ErrorSeverity.ERROR,
      metadata: { userId: '123' },
    };

    await service.saveLog(logData);

    // It should handle the error and call the logger.error method
    expect(mockLoggerService.error).toHaveBeenCalled();
  });

  // EDGE CASE
  it('should handle empty metadata when saving logs', async () => {
    const logData = {
      message: 'Test error message',
      context: 'TestContext',
      severity: ErrorSeverity.ERROR,
      metadata: {},
    };

    await service.saveLog(logData);

    expect(mockModel.create).toHaveBeenCalledWith(logData);
  });
});
