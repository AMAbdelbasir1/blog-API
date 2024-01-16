import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';
import * as compression from 'compression';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  // app.useGlobalFilters(new NotFoundExceptionFilter());
  app.use(express.urlencoded({ extended: false }));
  // somewhere in your initialization file
  app.use(compression());

  const server = await app.listen(3000);
  process.on('unhandledRejection', (err) => {
    console.error(`UnhandledRejection Errors: ${err}`);
    server.close(() => {
      console.error(`Shutting down....`);
      process.exit(1);
    });
  });
}
bootstrap();
