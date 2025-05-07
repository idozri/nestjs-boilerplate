import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ExceptionLogService } from './common/services/exception-log.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// Load environment variables
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  // Security headers
  app.use(helmet());

  // Enable CORS with default or custom options
  app.enableCors({
    origin: '*', // 👈 replace with your domain in production
    credentials: true,
  });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  // Global filters
  const logService = app.get(ExceptionLogService);
  app.useGlobalFilters(new AllExceptionsFilter(logService));

  // Optional: Prefix all routes with /api
  app.setGlobalPrefix('api');

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('NestJS Boilerplate')
    .setDescription('API documentation for the NestJS Boilerplate')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT', 3033);
  await app.listen(port);
  console.log(`Application listening on port ${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api/docs`);
}
bootstrap();
