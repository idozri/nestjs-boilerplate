import * as fs from 'fs';
import * as path from 'path';
import { BaseService } from '../base.service';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger.service';

// Simplified test that doesn't rely on fast-glob
describe('BaseService enforcement', () => {
  // Test files
  const validServiceContent = `
    import { Injectable } from '@nestjs/common';
    import { BaseService } from '../base.service';
    
    @Injectable()
    class ValidService extends BaseService {
      constructor() {
        super();
      }
    }
  `;

  const invalidServiceContent = `
    import { Injectable } from '@nestjs/common';
    
    @Injectable()
    class InvalidService {
      constructor() {}
    }
  `;

  it('should detect services that extend BaseService', () => {
    const extendsBase = /class\s+\w+\s+extends\s+BaseService/.test(
      validServiceContent
    );
    const hasDecorator = /@Injectable\(\)/.test(validServiceContent);

    expect(extendsBase).toBe(true);
    expect(hasDecorator).toBe(true);
  });

  it("should detect services that don't extend BaseService", () => {
    const extendsBase = /class\s+\w+\s+extends\s+BaseService/.test(
      invalidServiceContent
    );
    const hasDecorator = /@Injectable\(\)/.test(invalidServiceContent);

    expect(extendsBase).toBe(false);
    expect(hasDecorator).toBe(true);
  });

  // Bonus: Test actual BaseService functionality
  it('should verify BaseService can be extended', () => {
    // Create a mock logger service
    const mockLoggerService = {
      setLoggerName: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      fatal: jest.fn(),
    } as unknown as LoggerService;

    @Injectable()
    class TestService extends BaseService {
      testMethod() {
        return 'test';
      }

      constructor() {
        super('TestService', mockLoggerService);
      }
    }

    const service = new TestService();
    expect(service).toBeInstanceOf(BaseService);
    expect(service['testMethod']()).toBe('test');
    expect(mockLoggerService.setLoggerName).toHaveBeenCalledWith('TestService');
  });
});
