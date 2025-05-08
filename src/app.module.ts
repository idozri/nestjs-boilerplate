import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ExceptionLogModule } from './common/services/exception-log.module';
import { AppController } from './app.controller';
import { LoggerService } from './common/services/logger.service';
import { LoggerModule } from './common/services/logger.module';
import { RbacGuard } from './rbac/rbac.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    ExceptionLogModule,

    // Register default logger with name 'App'
    LoggerModule.register('App', LoggerService.name),
  ],
  controllers: [AppController],
  providers: [
    LoggerService,
    {
      provide: APP_GUARD,
      useClass: RbacGuard,
    },
  ],
  exports: [LoggerService],
})
export class AppModule {}
