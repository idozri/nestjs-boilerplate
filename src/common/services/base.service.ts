import { LoggerService } from './logger.service';

/**
 * Extend this class in all services that need logging.
 * It provides a pre-configured `logger` property using LoggerService with the service's context name.
 *
 * Example:
 *
 * export class UserService extends BaseService {
 *   constructor(logger: LoggerService) {
 *     super('UserService', logger);
 *   }
 *
 *   doSomething() {
 *     this.logger.debug('Did something!');
 *   }
 * }
 */

export abstract class BaseService {
  protected logger: LoggerService;

  constructor(loggerName: string, logger: LoggerService) {
    this.logger = logger;
    this.logger.setLoggerName(loggerName);
  }
}
