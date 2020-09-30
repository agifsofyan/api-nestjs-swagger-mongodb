import { Module } from '@nestjs/common';
import { XenditController } from './xendit.controller';
import { XenditService } from './xendit.service';

@Module({
  controllers: [XenditController],
  providers: [XenditService]
})
export class XenditModule {}
