<<<<<<< HEAD
import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { FastifyReply } from 'fastify';
=======
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
>>>>>>> master

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
<<<<<<< HEAD
  index(@Res() res: FastifyReply) {
    return res.status(HttpStatus.OK).send({ success: true, message: 'laruno-backend-api-v1' });
=======
  getHello(): string {
    return this.appService.getHello();
>>>>>>> master
  }
}
