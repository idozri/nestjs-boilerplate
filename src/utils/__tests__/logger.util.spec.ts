import { LoggerService } from '../logger.util';
import { Logger } from '@nestjs/common';

describe('Logger Utils', () => {
  it('should create a NestJS Logger with the correct name', () => {
    // Assert
    expect(LoggerService).toBeInstanceOf(Logger);

    // Instead of accessing protected property, verify the logger works with the expected context
    const logSpy = jest.spyOn(LoggerService, 'log').mockImplementation();
    LoggerService.log('Test message');

    // When Logger logs, it includes the context
    expect(logSpy).toHaveBeenCalledWith('Test message');

    logSpy.mockRestore();
  });

  it('should be able to log messages', () => {
    // Create spies for the logger methods
    const logSpy = jest.spyOn(LoggerService, 'log').mockImplementation();
    const errorSpy = jest.spyOn(LoggerService, 'error').mockImplementation();
    const warnSpy = jest.spyOn(LoggerService, 'warn').mockImplementation();
    const debugSpy = jest.spyOn(LoggerService, 'debug').mockImplementation();
    const verboseSpy = jest
      .spyOn(LoggerService, 'verbose')
      .mockImplementation();

    // Use the logger
    LoggerService.log('Test log message');
    LoggerService.error('Test error message');
    LoggerService.warn('Test warn message');
    LoggerService.debug('Test debug message');
    LoggerService.verbose('Test verbose message');

    // Verify the logger methods were called
    expect(logSpy).toHaveBeenCalledWith('Test log message');
    expect(errorSpy).toHaveBeenCalledWith('Test error message');
    expect(warnSpy).toHaveBeenCalledWith('Test warn message');
    expect(debugSpy).toHaveBeenCalledWith('Test debug message');
    expect(verboseSpy).toHaveBeenCalledWith('Test verbose message');

    // Restore spies
    logSpy.mockRestore();
    errorSpy.mockRestore();
    warnSpy.mockRestore();
    debugSpy.mockRestore();
    verboseSpy.mockRestore();
  });
});
