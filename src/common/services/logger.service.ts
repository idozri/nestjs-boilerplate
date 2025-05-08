import { Injectable, Logger } from '@nestjs/common';
import { ErrorSeverity } from '../enums/error-severity.enum';
import { ExceptionLogService } from '../services/exception-log.service';
import { sendTelegramAlert } from '../utils/telegram-alert.util';
import { LogEventPayload } from '../interfaces/logger-payload.interface';

const SEVERITY_CONFIG = {
  [ErrorSeverity.FATAL]: {
    icon: '🚨',
    label: 'FATAL ALERT',
  },
  [ErrorSeverity.ERROR]: {
    icon: '🚨',
    label: 'ERROR',
  },
  [ErrorSeverity.DEBUG]: {
    icon: '🐞',
    label: 'DEBUG',
  },
  [ErrorSeverity.INFO]: {
    icon: 'ℹ️',
    label: 'INFO',
  },
  [ErrorSeverity.WARN]: {
    icon: '⚠️',
    label: 'WARNING',
  },
};

// Map severity levels to NestJS Logger methods
const SEVERITY_TO_LOGGER_METHOD = {
  [ErrorSeverity.FATAL]: 'error',
  [ErrorSeverity.ERROR]: 'error',
  [ErrorSeverity.DEBUG]: 'debug',
  [ErrorSeverity.INFO]: 'log',
  [ErrorSeverity.WARN]: 'warn',
};

@Injectable()
export class LoggerService {
  private loggerName = 'LoggerService';
  private logger = new Logger(this.loggerName);

  constructor(
    private exceptionLogService: ExceptionLogService,
    loggerName?: string
  ) {
    if (loggerName) this.setLoggerName(loggerName);
  }

  setLoggerName(name: string) {
    this.loggerName = name;
    this.logger = new Logger(this.loggerName);
    this.logger.debug(
      `LoggerService initialized with name: ${this.loggerName}`
    );
  }

  fatal(message: string, payload?: LogEventPayload) {
    return this.handleLogEvent(message, payload ?? {}, ErrorSeverity.FATAL);
  }

  error(message: string, payload?: LogEventPayload) {
    return this.handleLogEvent(message, payload ?? {}, ErrorSeverity.ERROR);
  }

  warn(message: string, payload?: LogEventPayload) {
    return this.handleLogEvent(message, payload ?? {}, ErrorSeverity.WARN);
  }

  info(message: string, payload?: LogEventPayload) {
    return this.handleLogEvent(message, payload ?? {}, ErrorSeverity.INFO);
  }

  debug(message: string, payload?: LogEventPayload) {
    return this.handleLogEvent(message, payload ?? {}, ErrorSeverity.DEBUG);
  }

  private async handleLogEvent(
    message: string,
    payload: LogEventPayload,
    severity: ErrorSeverity = ErrorSeverity.INFO
  ) {
    const {
      context = 'General',
      metadata = {},
      data = {},
      cause,
      options,
    } = payload;

    const logMessage = this.generateLogMessage(
      message,
      {
        context,
        metadata,
        data,
        cause,
      },
      severity
    );

    // Map severity to the appropriate NestJS Logger method
    const loggerMethod = SEVERITY_TO_LOGGER_METHOD[severity] || 'log';
    this.logger[loggerMethod](logMessage);

    if (options?.sendAlert) {
      sendTelegramAlert(logMessage, this);
    }

    if (options?.saveToDb) {
      /* istanbul ignore next */
      const structuredCause =
        cause instanceof Error
          ? {
              name: cause.name,
              message: cause.message,
              stack: cause.stack,
            }
          : typeof cause === 'string'
            ? { message: cause }
            : undefined;

      this.exceptionLogService.saveLog({
        message,
        context,
        severity,
        data,
        metadata,
        cause: structuredCause,
      });
    }
  }

  /* istanbul ignore next */
  private generateLogMessage(
    message: string,
    { context = 'General', metadata = {}, data = {}, cause }: LogEventPayload,
    severity: ErrorSeverity = ErrorSeverity.INFO
  ): string {
    const { icon, label } = SEVERITY_CONFIG[severity];

    let formatted = `${icon} [${label}] ${context}\n📝 ${message}`;

    if (Object.keys(metadata).length > 0) {
      formatted += `\n\n🧩 Metadata:\n${JSON.stringify(metadata, null, 2)}`;
    }

    if (Object.keys(data).length > 0) {
      formatted += `\n\n📦 Data:\n${JSON.stringify(data, null, 2)}`;
    }

    if (cause) {
      const causeBlock =
        cause instanceof Error
          ? {
              name: cause.name,
              message: cause.message,
              stack: cause.stack,
            }
          : { message: String(cause) };

      formatted += `\n\n💥 Cause:\n${JSON.stringify(causeBlock, null, 2)}`;
    }

    return formatted;
  }
}
