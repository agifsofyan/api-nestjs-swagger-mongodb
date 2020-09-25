import { Module } from '@nestjs/common';

import { XenditService } from './xendit.service';

@Module({
  providers: [XenditService]
})
export class XenditModule {}
