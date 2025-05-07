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
import { logAppEvent } from '../utils/log-app-event.util';
import { ExceptionLogService } from '../services/exception-log.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logService: ExceptionLogService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Unexpected error occurred';
    let severity = ErrorSeverity.LOW;

    if (exception instanceof AppException) {
      status = exception.getStatus();
      message = exception.message;
      severity = exception.severity;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : JSON.stringify(res);
    } else if (typeof exception === 'object' && exception !== null) {
      message = JSON.stringify(exception);
    } else {
      message = String(exception);
    }

    if (
      status >= 500 &&
      severity === ErrorSeverity.LOW &&
      (message.includes('Mongo') ||
        message.includes('UnhandledPromise') ||
        message.includes('TypeError') ||
        message.includes('ECONNREFUSED') ||
        message.includes('Redis') ||
        message.includes('Connection timeout'))
    ) {
      severity = ErrorSeverity.HIGH;
    }

    await logAppEvent(
      message,
      `${request.method} ${request.url}`,
      severity,
      { path: request.url, method: request.method, status },
      { sendAlert: true, saveToDb: true },
      this.logService
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
