import { Logger } from '@nestjs/common';
import { ErrorSeverity } from '../enums/error-severity.enum';
import { ExceptionLogService } from '../services/exception-log.service';
import { sendTelegramAlert } from './telegram-alert.util';
import { text } from 'body-parser';

const logger = new Logger('LogAppEvent');

export async function logAppEvent(
  message: string,
  context: string = 'General',
  severity: ErrorSeverity = ErrorSeverity.LOW,
  metadata: Record<string, any> = {},
  options: { sendAlert?: boolean; saveToDb?: boolean } = {
    sendAlert: true,
    saveToDb: true,
  },
  logService?: ExceptionLogService
) {
  const logMessage = `[${context}] ${message} ${JSON.stringify(metadata)}`;

  let icon = '';
  let label = '';

  switch (severity) {
    case ErrorSeverity.CRITICAL:
      icon = '🚨';
      label = 'CRITICAL ALERT';
      logger.error(logMessage);
      break;
    case ErrorSeverity.HIGH:
      icon = '⚠️';
      label = 'HIGH WARNING';
      logger.warn(logMessage);
      break;
    case ErrorSeverity.MEDIUM:
      icon = '🟠';
      label = 'MEDIUM WARNING';
      logger.log(logMessage);
      break;
    case ErrorSeverity.LOW:
    default:
      icon = '🔔';
      label = 'LOW NOTICE';
      logger.debug(logMessage);
      break;
  }

  if (options.sendAlert) {
    const alertMessage = `${icon} *[${label}]* *in ${context}*\n${message}\n\n*Details:*\n\`\`\`${JSON.stringify(metadata, null, 2)}\`\`\``;
    sendTelegramAlert(alertMessage).catch((err) =>
      logger.warn(`Failed to send Telegram alert: ${err.message}`)
    );
  }

  if (options.saveToDb && logService) {
    try {
      await logService.saveLog(message, context, severity, metadata);
    } catch (err) {
      logger.warn(`Failed to save exception to DB: ${err.message}`);
    }
  }
}
