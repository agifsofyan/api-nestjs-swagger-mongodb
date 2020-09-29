import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as session from 'express-session';
import * as connectMongo from 'connect-mongo';
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';

import { AppModule } from './app.module';
import { MONGO_URI, PORT } from './config/configuration';

async function bootstrap() {
  const MongoStore = connectMongo(session);

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.enableCors({
		origin: "*",
		methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
		allowedHeaders: "Content-Type, Accept",
  });

  app.use(
    session({
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        secure: false,
      },
      secret: process.env.SESSION_SECRET,
      resave: true,
      saveUninitialized: true,
      store: new MongoStore({
        url: MONGO_URI,
        collection: 'sessions',
      })
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api/v1');

  // Swagger API Documentation
  const options = new DocumentBuilder()
    .setTitle('laruno-client-api-v1')
    .setDescription(`API ${process.env.NODE_ENV}.`)
    .setVersion('1.0')
    .addTag('API')
    .build();

  const document = SwaggerModule.createDocument(app, options);    
  SwaggerModule.setup('api/v1/docs', app, document);

  await app.listen(PORT);

  console.log(`[API] laruno-client-api started running in ${process.env.NODE_ENV} mode on port 5000.`);
}
bootstrap();
