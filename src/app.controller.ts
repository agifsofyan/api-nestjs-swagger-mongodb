import { Controller, Get, Res } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  getHello(@Res() res) {
    return res.status(200).json({ success: true, message: 'laruno-backend-api-v1' });
  }
}
