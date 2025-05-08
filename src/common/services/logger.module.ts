// src/common/logger.module.ts
import { Module, DynamicModule } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { ExceptionLogService } from './exception-log.service';

@Module({})
export class LoggerModule {
  static register(loggerName: string, token: string): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        {
          provide: token,
          useFactory: (exceptionLogService: ExceptionLogService) =>
            new LoggerService(exceptionLogService, loggerName),
          inject: [ExceptionLogService],
        },
      ],
      exports: [token],
    };
  }
}
