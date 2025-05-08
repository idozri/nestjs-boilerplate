import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppException } from '../exceptions/app.exception';
import { ErrorSeverity } from '../enums/error-severity.enum';
import { LoggerService } from '../services/logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Unexpected error occurred';
    let severity = ErrorSeverity.ERROR;

    if (exception instanceof AppException) {
      status = exception.getStatus();
      message = exception.message;
      severity = exception.severity;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : JSON.stringify(res);
    } else if (exception instanceof Error) {
      message = exception.message || String(exception);
    } else if (typeof exception === 'object' && exception !== null) {
      message = JSON.stringify(exception);
    } else {
      message = String(exception);
    }

    if (
      status >= 500 &&
      severity === ErrorSeverity.ERROR &&
      this.shouldUpgradeSeverity(message)
    ) {
      severity = ErrorSeverity.FATAL;
    }

    if (severity === ErrorSeverity.FATAL) {
      this.logger.fatal(message, {
        context: 'AllExceptionsFilter',
        metadata: { path: request.url, method: request.method, status },
        cause: exception instanceof Error ? exception : undefined,
        options: { sendAlert: true, saveToDb: true },
      });
    } else {
      this.logger.error(message, {
        context: 'AllExceptionsFilter',
        metadata: { path: request.url, method: request.method, status },
        cause: exception instanceof Error ? exception : undefined,
        options: { sendAlert: status >= 500, saveToDb: true },
      });
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }

  private shouldUpgradeSeverity(message: string): boolean {
    return (
      message.includes('Mongo') ||
      message.includes('UnhandledPromise') ||
      message.includes('TypeError') ||
      message.includes('ECONNREFUSED') ||
      message.includes('Redis') ||
      message.includes('Connection timeout')
    );
  }
}
