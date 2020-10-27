import { Module, HttpModule } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
