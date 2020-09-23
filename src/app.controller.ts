import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  index(@Res() res) {
    return res.status(HttpStatus.OK).send({ success: true, message: 'laruno-client-api-v1' });
  }
}
