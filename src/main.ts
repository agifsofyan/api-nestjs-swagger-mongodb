import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api/v1');

  // Swagger API Documentation
  const options = new DocumentBuilder()
    .setTitle('laruno-client-api-v1')
    .setDescription(`API ${process.env.API_ENV}.`)
    .setVersion('1.0')
    .addTag('API')
    .build();

  const document = SwaggerModule.createDocument(app, options);    
  SwaggerModule.setup('api/v1/docs', app, document);

  await app.listen(5000, '0.0.0.0');

  console.log(`[API] laruno-client-api started running in ${process.env.API_ENV} mode on port 5000.`);
}
bootstrap();
