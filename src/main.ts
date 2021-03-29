import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as fs from 'fs';
import { AppModule } from './app.module';
import { PORT } from './config/configuration';

async function bootstrap() {
  
  // to activate SSL
  const httpsOptions = {
    key:  fs.readFileSync('src/cert/laruno.id.key'),
    cert: fs.readFileSync('src/cert/laruno.id.pem'),
    requestCert: false,
    rejectUnauthorized: false
  };

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {cors: true});

  // app.enableCors();
  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api/v1');
  app.useWebSocketAdapter(new WsAdapter(app) as any);

  // Swagger API Documentation
  const options = new DocumentBuilder()
    .setTitle('laruno-client-api-v1')
    .setDescription(`API ${process.env.NODE_ENV}.`)
    .setVersion('1.0')
    // .addBearerAuth({ type: "apiKey", in: "header", name: "Authorization", description: "HTTP/HTTP Bearer" })
    .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT", description: "HTTP/HTTP Bearer" })
    .addTag('API')
    .build();

  const document = SwaggerModule.createDocument(app, options);    
  SwaggerModule.setup('api/v1/docs', app, document);

  await app.listen(PORT);

  console.log(`[API] laruno-client-api started running in ${process.env.NODE_ENV} mode on port ${PORT}`);
}
bootstrap();
