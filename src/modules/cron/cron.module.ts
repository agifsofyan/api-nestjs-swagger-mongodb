import { forwardRef, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './cron.service';
import { OrderModule } from '../order/order.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    forwardRef(() => OrderModule),
    ScheduleModule.forRoot(),
    MailModule
  ],
  providers: [CronService],
  exports: [ScheduleModule, CronService]
})
export class CronModule {}
