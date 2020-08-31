import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { UserModule } from './user/user.module';
import { ProfileModule } from './profile/profile.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  app.useGlobalPipes(new ValidationPipe());

  // Swagger API Documentation
  const options = new DocumentBuilder()
    .setTitle('laruno-backend-api-v1')
    .setDescription(`API ${process.env.API_ENV}.`)
    .setVersion('1.0')
    .addTag('API')
    .build();
  const document = SwaggerModule.createDocument(app, options, {
    include: [
      UserModule,
      ProfileModule
    ]
  });    
  SwaggerModule.setup('api/v1/docs', app, document);

  await app.listen(5000);

  console.log(`[API] laruno-backend-api started running in ${process.env.API_ENV} mode on port 5000.`);
}
bootstrap();
