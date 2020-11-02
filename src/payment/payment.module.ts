import { Module, HttpModule } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentAccountModule } from './account/account.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    PaymentAccountModule
  ],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
