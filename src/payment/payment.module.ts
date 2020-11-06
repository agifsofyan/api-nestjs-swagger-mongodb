import { Module, HttpModule } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentMethodModule } from './method/method.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    PaymentMethodModule,
    UserModule
  ],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
