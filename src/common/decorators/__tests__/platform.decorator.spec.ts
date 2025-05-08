import { ExecutionContext } from '@nestjs/common';
import { Platform } from '../platform.decorator';
import { createParamDecorator } from '@nestjs/common';

// Mock createParamDecorator
jest.mock('@nestjs/common', () => {
  const original = jest.requireActual('@nestjs/common');
  return {
    ...original,
    createParamDecorator: jest.fn((factory) => factory),
  };
});

describe('Platform Decorator', () => {
  it('should extract platform key from headers', () => {
    // Create mock execution context
    const mockRequest = {
      headers: {
        'x-platform-key': 'test-platform',
      },
    };

    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ExecutionContext;

    // Call the decorated method directly
    // Platform is actually just a function that takes data and context
    const result = Platform(null, mockContext);

    // Assert the platform key was extracted
    expect(result).toBe('test-platform');
    expect(mockContext.switchToHttp).toHaveBeenCalled();
  });

  it('should return undefined when platform key is missing', () => {
    // Create mock execution context without platform key
    const mockRequest = {
      headers: {},
    };

    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ExecutionContext;

    // Call the decorated method directly
    const result = Platform(null, mockContext);

    // Assert undefined is returned when key is missing
    expect(result).toBeUndefined();
  });
});
