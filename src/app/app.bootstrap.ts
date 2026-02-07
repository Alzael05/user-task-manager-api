import { NestFactory } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';

export async function createApp(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  // Use Pino logger
  app.useLogger(app.get(Logger));

  const PREFIX = 'api';
  app.setGlobalPrefix(PREFIX);

  // app.enableVersioning({
  //   type: VersioningType.URI,
  //   defaultVersion: '1',
  // });

  // Don't reveal underlying server implementation
  app.getHttpAdapter().getInstance().disable('x-powered-by');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Serialize responses (exclude password, etc.)
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get('Reflector')),
  );

  // Swagger setup
  const openApiSpecs = new DocumentBuilder()
    .setTitle('User & Task Management API')
    .setDescription(
      'API for managing users and tasks with role-based access control',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, openApiSpecs);
  SwaggerModule.setup(`${PREFIX}/openapi`, app, document);

  await app.init();

  return app;
}
