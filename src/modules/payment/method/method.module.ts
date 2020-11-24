import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentMethodService } from './method.service';
import { PaymentMethodController } from './method.controller';
import { PaymentMethodSchema } from './schemas/payment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
		  { name: 'PaymentMethod', schema: PaymentMethodSchema },
    ])
  ],
  providers: [PaymentMethodService],
  controllers: [PaymentMethodController],
  exports: [MongooseModule, PaymentMethodService]
})
export class PaymentMethodModule {}
