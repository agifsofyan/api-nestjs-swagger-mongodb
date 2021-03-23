import { Module, HttpModule, forwardRef } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentMethodModule } from './method/method.module';
import { UserModule } from '../user/user.module';
import { DanaModule } from './dana/dana.module';
import { XenditModule } from './xendit/xendit.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    PaymentMethodModule,
    forwardRef(() => UserModule),
    DanaModule,
    XenditModule
  ],
  providers: [PaymentService],
  exports: [HttpModule, PaymentMethodModule, DanaModule, XenditModule, PaymentService],
})
export class PaymentModule {}
