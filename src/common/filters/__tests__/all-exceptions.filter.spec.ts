import { Test, TestingModule } from '@nestjs/testing';
import { AllExceptionsFilter } from '../all-exceptions.filter';
import { ExceptionLogService } from '../../services/exception-log.service';
import { AppException } from '../../exceptions/app.exception';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorSeverity } from '../../enums/error-severity.enum';
import { ArgumentsHost } from '@nestjs/common';
import { LoggerService } from '../../services/logger.service';

// Create direct access to the AllExceptionsFilter to test its internal logic
class TestableAllExceptionsFilter extends AllExceptionsFilter {
  public testSeverityUpgrade(message: string): boolean {
    return this['shouldUpgradeSeverity'](message);
  }
}

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let loggerService: LoggerService;
  let exceptionLogService: ExceptionLogService;

  // Mock response object
  const mockJson = jest.fn();
  const mockStatus = jest.fn().mockImplementation(() => ({
    json: mockJson,
  }));

  // Mock request object
  const mockRequest = {
    url: '/test',
    method: 'GET',
  };

  // Mock ArgumentsHost
  const mockArgumentsHost = {
    switchToHttp: jest.fn().mockReturnValue({
      getResponse: jest.fn().mockReturnValue({
        status: mockStatus,
      }),
      getRequest: jest.fn().mockReturnValue(mockRequest),
    }),
  } as unknown as ArgumentsHost;

  beforeEach(async () => {
    // Reset mocks before each test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LoggerService,
          useValue: {
            error: jest.fn(),
            fatal: jest.fn(),
            info: jest.fn(),
            debug: jest.fn(),
            warn: jest.fn(),
            setLoggerName: jest.fn(),
          },
        },
        {
          provide: ExceptionLogService,
          useValue: {
            saveLog: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: AllExceptionsFilter,
          useFactory: (logger: LoggerService) => {
            return new AllExceptionsFilter(logger);
          },
          inject: [LoggerService],
        },
      ],
    }).compile();

    filter = module.get<AllExceptionsFilter>(AllExceptionsFilter);
    loggerService = module.get<LoggerService>(LoggerService);
    exceptionLogService = module.get<ExceptionLogService>(ExceptionLogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  // SUCCESS CASE: Handling AppException
  it('should handle AppException correctly', async () => {
    const exception = new AppException(
      'Custom error',
      HttpStatus.BAD_REQUEST,
      ErrorSeverity.WARN
    );

    await filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Custom error',
        path: '/test',
      })
    );
    expect(loggerService.error).toHaveBeenCalled();
  });

  // FAILURE CASE: Handling standard HttpException
  it('should handle HttpException correctly', async () => {
    const exception = new HttpException('Not found', HttpStatus.NOT_FOUND);

    await filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        path: '/test',
      })
    );
    expect(loggerService.error).toHaveBeenCalled();
  });

  // EDGE CASE: Handling unknown error
  it('should handle unknown error types', async () => {
    const exception = new Error('Unknown error');

    await filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        path: '/test',
      })
    );
    expect(loggerService.error).toHaveBeenCalled();
  });

  // Directly test the shouldUpgradeSeverity method
  it('should correctly determine when to upgrade severity', () => {
    // Create a testable filter instance
    const testableFilter = new TestableAllExceptionsFilter(loggerService);

    // Test with fatal error messages that should be upgraded
    expect(
      testableFilter.testSeverityUpgrade('MongoDB connection refused')
    ).toBe(true);
    expect(
      testableFilter.testSeverityUpgrade('UnhandledPromise rejection')
    ).toBe(true);
    expect(testableFilter.testSeverityUpgrade('TypeError occurred')).toBe(true);
    expect(testableFilter.testSeverityUpgrade('ECONNREFUSED error')).toBe(true);
    expect(testableFilter.testSeverityUpgrade('Redis server down')).toBe(true);
    expect(
      testableFilter.testSeverityUpgrade('Connection timeout occurred')
    ).toBe(true);

    // Test with regular messages that should not be upgraded
    expect(testableFilter.testSeverityUpgrade('Some generic error')).toBe(
      false
    );
    expect(testableFilter.testSeverityUpgrade('Not found')).toBe(false);
    expect(testableFilter.testSeverityUpgrade('User input error')).toBe(false);
  });

  // EDGE CASE: Handling database connection errors
  it('should identify high severity database errors', async () => {
    // Create the database error
    const exception = new Error('MongoDB connection refused');

    // Since we've refactored the filter to use a private method, we need to
    // spy on the logger methods to check what's called
    const fatalSpy = jest.spyOn(loggerService, 'fatal');
    const errorSpy = jest.spyOn(loggerService, 'error');

    // Call the regular filter (not a custom one)
    await filter.catch(exception, mockArgumentsHost);

    // Verify HTTP response
    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);

    // For database errors, fatal should be called instead of error
    expect(fatalSpy).toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  // Test case for a complex HttpException response
  it('should handle HttpException with complex response object', async () => {
    const responseObj = {
      error: 'Validation Error',
      messages: ['Field is required'],
    };
    const exception = new HttpException(responseObj, HttpStatus.BAD_REQUEST);

    await filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: JSON.stringify(responseObj),
      })
    );
    expect(loggerService.error).toHaveBeenCalled();
  });

  // Test case for null exception (edge case)
  it('should handle null exceptions', async () => {
    const exception = null;

    await filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'null',
      })
    );
    expect(loggerService.error).toHaveBeenCalled();
  });

  // Add test case for object exception that is not an Error instance
  it('should handle non-error object exceptions and stringify them', async () => {
    // Create a plain object as the exception
    const exception = {
      custom: true,
      reason: 'Test object exception',
    };

    await filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: JSON.stringify(exception),
      })
    );
    expect(loggerService.error).toHaveBeenCalled();
  });

  // Test case for exception with empty message
  it('should handle Error objects with empty message', async () => {
    // Create an Error with empty message
    const exception = new Error();

    await filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error',
      })
    );
    expect(loggerService.error).toHaveBeenCalled();
  });

  // Test fatal error with sendAlert option
  it('should log fatal errors with sendAlert option', async () => {
    const exception = new Error('Connection timeout occurred');

    await filter.catch(exception, mockArgumentsHost);

    // This should call logger.fatal with specific options
    expect(loggerService.fatal).toHaveBeenCalledWith(
      'Connection timeout occurred',
      expect.objectContaining({
        options: expect.objectContaining({
          sendAlert: true,
          saveToDb: true,
        }),
      })
    );
  });

  // Test error with status 500 but not fatal
  it('should log 500 errors with sendAlert=true', async () => {
    // Create an error that wouldn't trigger severity upgrade
    const exception = new Error('Generic 500 error');

    await filter.catch(exception, mockArgumentsHost);

    // This should call logger.error with sendAlert true
    expect(loggerService.error).toHaveBeenCalledWith(
      'Generic 500 error',
      expect.objectContaining({
        options: expect.objectContaining({
          sendAlert: true, // For 500 errors, sendAlert should be true
          saveToDb: true,
        }),
      })
    );
  });

  // Test error with status < 500
  it('should log sub-500 errors with sendAlert=false', async () => {
    const exception = new HttpException('Bad Request', HttpStatus.BAD_REQUEST);

    await filter.catch(exception, mockArgumentsHost);

    // This should call logger.error with sendAlert false
    expect(loggerService.error).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        options: expect.objectContaining({
          sendAlert: false, // For non-500 errors, sendAlert should be false
          saveToDb: true,
        }),
      })
    );
  });

  // Test case for HttpException without response
  it('should handle HttpException with no response', async () => {
    // Create a mock HttpException with getResponse returning undefined
    const exception = {
      getStatus: jest.fn().mockReturnValue(HttpStatus.BAD_REQUEST),
      getResponse: jest.fn().mockReturnValue(undefined),
      message: 'Test exception',
    } as unknown as HttpException;

    await filter.catch(exception, mockArgumentsHost);

    // Since the response is undefined, the filter will use the default 500 status
    // rather than the BAD_REQUEST status from getStatus()
    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);

    // The message will be the stringified object with the exception's message property
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: JSON.stringify({ message: 'Test exception' }), // This is what the actual code does
      })
    );
    expect(loggerService.error).toHaveBeenCalled();
  });

  // General error handling test
  it('should handle and log all exceptions', async () => {
    const exception = new Error('Generic error');

    await filter.catch(exception, mockArgumentsHost);

    // Verify the response has the correct status code
    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);

    // Verify that the error was logged
    expect(loggerService.error).toHaveBeenCalled();

    // Verify response format
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        path: '/test',
        message: expect.any(String),
        timestamp: expect.any(String),
      })
    );
  });

  // Basic error handling test
  it('should handle errors and log them properly', async () => {
    // More generic error handling test
    const exception = new Error('Some error message');

    // Clear call history
    jest.clearAllMocks();

    await filter.catch(exception, mockArgumentsHost);

    // Just verify the response was formatted correctly with status 500
    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        path: '/test',
      })
    );

    // Verify logging was called
    expect(loggerService.error).toHaveBeenCalled();
  });

  // Test all cases of severity upgrading patterns
  it('should upgrade severity for various fatal error patterns', async () => {
    const fatalErrorPatterns = [
      'MongoDB connection refused',
      'UnhandledPromise rejection caught',
      'TypeError: Cannot read property of undefined',
      'ECONNREFUSED when connecting to service',
      'Redis connection timed out',
      'Connection timeout after 30s',
    ];

    for (const errorMessage of fatalErrorPatterns) {
      jest.clearAllMocks();
      const errorSpy = jest.spyOn(loggerService, 'error');
      const fatalSpy = jest.spyOn(loggerService, 'fatal');

      const exception = new Error(errorMessage);

      await filter.catch(exception, mockArgumentsHost);

      expect(fatalSpy).toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();
    }
  });

  // Test status code < 500 with error severity to ensure it doesn't upgrade
  it('should not upgrade severity when status code < 500', async () => {
    // Create a 400 error that would have matched a severity upgrade keyword
    const exception = new HttpException(
      'MongoDB connection refused',
      HttpStatus.BAD_REQUEST
    );

    jest.clearAllMocks();
    const errorSpy = jest.spyOn(loggerService, 'error');
    const fatalSpy = jest.spyOn(loggerService, 'fatal');

    await filter.catch(exception, mockArgumentsHost);

    // Should not upgrade to fatal since status is 400
    expect(fatalSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
  });

  // Test case for severity not being upgraded on 500+ error that doesn't have matching keywords
  it("should not upgrade severity for 500 errors that don't match upgrade keywords", async () => {
    // Create a regular server error that doesn't match upgrade keywords
    const exception = new HttpException(
      'Some generic server error',
      HttpStatus.INTERNAL_SERVER_ERROR
    );

    jest.clearAllMocks();
    const errorSpy = jest.spyOn(loggerService, 'error');
    const fatalSpy = jest.spyOn(loggerService, 'fatal');

    await filter.catch(exception, mockArgumentsHost);

    // Should not upgrade to fatal since message doesn't match keywords
    expect(fatalSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();

    // Verify sendAlert was still set to true for 500 error
    expect(errorSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        options: expect.objectContaining({
          sendAlert: true,
        }),
      })
    );
  });

  // Test regular errors don't trigger severity upgrade
  it('should not upgrade severity for regular errors', async () => {
    const regularErrors = [
      'Not found',
      'Invalid input',
      'User error',
      'Permission denied',
    ];

    for (const errorMessage of regularErrors) {
      jest.clearAllMocks();
      const exception = new Error(errorMessage);

      await filter.catch(exception, mockArgumentsHost);

      expect(loggerService.fatal).not.toHaveBeenCalled();
      expect(loggerService.error).toHaveBeenCalled();
    }
  });

  // Test direct FATAL severity AppException (to cover the condition at line 37)
  it('should handle AppException with FATAL severity correctly', async () => {
    // Create an AppException with FATAL severity directly
    const fatalException = new AppException(
      'Critical system error',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorSeverity.FATAL
    );

    // Clear previous mock calls
    jest.clearAllMocks();

    // Spy on logger methods
    const fatalSpy = jest.spyOn(loggerService, 'fatal');
    const errorSpy = jest.spyOn(loggerService, 'error');

    // Process the exception
    await filter.catch(fatalException, mockArgumentsHost);

    // Verify fatal was called instead of error
    expect(fatalSpy).toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();

    // Verify the call parameters included saveToDb and sendAlert options
    expect(fatalSpy).toHaveBeenCalledWith(
      'Critical system error',
      expect.objectContaining({
        options: { sendAlert: true, saveToDb: true },
      })
    );
  });

  // Test case to directly test the shouldUpgradeSeverity method for branch coverage
  it('should correctly test all shouldUpgradeSeverity branches', () => {
    const filter = new TestableAllExceptionsFilter(loggerService);

    // Test all the keywords that should return true
    expect(filter.testSeverityUpgrade('MongoDB connection error')).toBe(true);
    expect(filter.testSeverityUpgrade('UnhandledPromise rejection')).toBe(true);
    expect(filter.testSeverityUpgrade('TypeError: cannot read property')).toBe(
      true
    );
    expect(filter.testSeverityUpgrade('ECONNREFUSED')).toBe(true);
    expect(filter.testSeverityUpgrade('Redis server unavailable')).toBe(true);
    expect(filter.testSeverityUpgrade('Connection timeout occurred')).toBe(
      true
    );

    // Test keywords that should return false
    expect(filter.testSeverityUpgrade('Regular error message')).toBe(false);
    expect(filter.testSeverityUpgrade('Something went wrong')).toBe(false);
    expect(filter.testSeverityUpgrade('')).toBe(false);
  });

  // Test case to directly test the conditional logic at line 54
  it('should handle non-string responses in HttpException', async () => {
    // Create a real HttpException with a non-string response object
    const responseObj = { error: 'Bad Request', message: 'Validation failed' };
    const exception = new HttpException(responseObj, HttpStatus.BAD_REQUEST);

    await filter.catch(exception, mockArgumentsHost);

    // Now it should use the status code from the exception
    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: expect.any(String),
      })
    );
  });

  // Test with complete HttpException coverage
  it('should handle HttpException with complex response objects', async () => {
    const responseObj = {
      statusCode: 400,
      message: [
        'email must be an email',
        'password must be at least 8 characters',
      ],
      error: 'Bad Request',
    };

    // Create a complete HttpException with a nested response
    const exception = new HttpException(responseObj, HttpStatus.BAD_REQUEST);

    await filter.catch(exception, mockArgumentsHost);

    // Verify it processes the response correctly
    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: expect.any(String),
      })
    );
  });
});
