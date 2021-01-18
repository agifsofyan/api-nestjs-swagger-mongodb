import { Module, HttpModule } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentMethodModule } from './method/method.module';
import { UserModule } from '../user/user.module';
import { DanaModule } from '../dana/dana.module';
import { DanaService } from '../dana/dana.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    PaymentMethodModule,
    UserModule,
    DanaModule
  ],
  providers: [PaymentService],
  exports: [HttpModule, PaymentService],
})
export class PaymentModule {}
