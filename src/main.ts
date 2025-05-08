import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggerService } from './common/services/logger.service';

/* istanbul ignore next */
dotenv.config();

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const logger = app.get(LoggerService);
  logger.setLoggerName('Bootstrap');

  app.use(helmet());

  app.enableCors({
    origin: '*', // Replace with real domain in prod
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  app.useGlobalFilters(new AllExceptionsFilter(logger));

  app.setGlobalPrefix('api');

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('NestJS Boilerplate')
    .setDescription('API documentation for the NestJS Boilerplate')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT', 3033);
  await app.listen(port);

  logger.info(`Application listening on port ${port}`, {
    context: 'NestBootstrap',
  });
  logger.debug(`Swagger UI available at /api/docs`, {
    context: 'NestBootstrap',
  });

  return app;
}

/* istanbul ignore next */
export const isMainModule = () => require.main === module;
/* istanbul ignore next */
export const callBootstrap = () => bootstrap();
/* istanbul ignore next */
export const executeIfMainModule = () => {
  if (isMainModule()) {
    callBootstrap();
    return true;
  }
  return false;
};

/* istanbul ignore next */
executeIfMainModule();
