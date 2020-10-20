import { Module, HttpModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { CreditCartSchema } from './schemas/payment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
		  { name: 'CreditCart', schema: CreditCartSchema },
    ]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [PaymentController],
  providers: [PaymentService]
})
export class PaymentModule {}
