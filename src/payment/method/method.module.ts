import { Module, HttpModule } from '@nestjs/common';
import { PaymentMethodController } from './method.controller';
import { PaymentMethodService } from './method.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5
    })
  ],
  providers: [PaymentMethodService],
  controllers: [PaymentMethodController],
  exports: [PaymentMethodService]
})
export class PaymentMethodModule {}
