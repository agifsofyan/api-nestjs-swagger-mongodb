import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerService } from './logger.service';
import { LoggerSchema } from '../logger/schemas/logger.schema';
import { LoggerController } from './logger.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
		{ name: 'Logger', schema: LoggerSchema }
    ])
  ],
  providers: [LoggerService],
  controllers: [LoggerController],
  exports: [MongooseModule, LoggerService]
})
export class LoggerModule {}
