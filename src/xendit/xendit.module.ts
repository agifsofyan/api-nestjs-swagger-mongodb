import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { XenditService } from './xendit.service';

@Module({
  providers: [XenditService],
  exports: [MongooseModule]
})
export class XenditModule {}
