import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // Link tài liệu: https://docs.nestjs.com/pipes#class-validator
  // Cài đặt thư viện: npm i --save class-validator class-transformer
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.use('/avatar', express.static(path.join(__dirname, '..', 'avatar')));
  app.use(
    '/avatar',
    express.static(path.join(__dirname, '..', 'public/images')),
  );
  app.use('/avatar', express.static(path.join(__dirname, '..', 'images')));

  // main.ts
  await app.listen(8000);
}

bootstrap();
