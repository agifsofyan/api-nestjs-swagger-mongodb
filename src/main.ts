import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { UserModule } from './user/user.module';

import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  // Swagger API Documentation
  const options = new DocumentBuilder()
    .setTitle('laruno-backend-api-v1')
    .setDescription(`${process.env.API_ENV} API.`)
    .setVersion('1.0')
    .addTag('API')
    .build();
  const document = SwaggerModule.createDocument(app, options, {
    include: [
      UserModule
    ]
  });    
  SwaggerModule.setup('api/v1', app, document);

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);

  console.log(`[API] laruno-backend-api started running in ${process.env.API_ENV} mode on port ${PORT}.`);
}
bootstrap();
