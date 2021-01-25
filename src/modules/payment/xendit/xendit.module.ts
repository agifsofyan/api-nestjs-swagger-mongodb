import { Module, HttpModule } from '@nestjs/common';
import { XenditService } from './xendit.service';
import { XenditController } from './xendit.controller';

@Module({
  imports: [
    HttpModule,
  ],
  providers: [XenditService],
  controllers: [XenditController],
  exports: [XenditService]
})
export class XenditModule {}
