import { HttpStatus } from '@nestjs/common';
import { AppException } from '../app.exception';
import { ErrorSeverity } from '../../enums/error-severity.enum';

describe('AppException', () => {
  // SUCCESS CASE: Testing basic initialization
  it('should create an exception with default values', () => {
    const message = 'Test exception';
    const exception = new AppException(message);

    expect(exception).toBeDefined();
    expect(exception.message).toBe(message);
    expect(exception.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(exception.severity).toBe(ErrorSeverity.ERROR);
  });

  // EDGE CASE: Custom status code
  it('should create an exception with custom status code', () => {
    const message = 'Test exception';
    const status = HttpStatus.BAD_REQUEST;
    const exception = new AppException(message, status);

    expect(exception.message).toBe(message);
    expect(exception.getStatus()).toBe(status);
    expect(exception.severity).toBe(ErrorSeverity.ERROR);
  });

  // EDGE CASE: Custom severity
  it('should create an exception with custom severity', () => {
    const message = 'Test exception';
    const status = HttpStatus.BAD_REQUEST;
    const severity = ErrorSeverity.FATAL;
    const exception = new AppException(message, status, severity);

    expect(exception.message).toBe(message);
    expect(exception.getStatus()).toBe(status);
    expect(exception.severity).toBe(severity);
  });
});
