import { Module, HttpModule } from '@nestjs/common';
import { XenditService } from './xendit.service';

@Module({
  imports: [
    HttpModule,
  ],
  providers: [XenditService],
  controllers: [],
  exports: [XenditService]
})
export class XenditModule {}
