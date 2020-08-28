import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { FastifyReply } from 'fastify';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  index(@Res() res: FastifyReply) {
    return res.status(HttpStatus.OK).send({ success: true, message: 'laruno-backend-api-v1' });
  }
}
