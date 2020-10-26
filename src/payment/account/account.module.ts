import { Module, HttpModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentAccountService } from './account.service';
import { PaymentAccountController } from './account.controller';
import { PaymentAccountSchema } from './schemas/account.schema';
import { PaymentMethodModule } from '../method/method.module';
import { UserModule } from '../../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
		  { name: 'PaymentAccount', schema: PaymentAccountSchema },
    ]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    UserModule,
    PaymentMethodModule
  ],
  providers: [PaymentAccountService],
  controllers: [PaymentAccountController],
  exports: [MongooseModule, PaymentAccountService]
})
export class PaymentAccountModule {}
