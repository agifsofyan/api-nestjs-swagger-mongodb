import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentMethodService } from './method.service';
import { PaymentMethodController } from './method.controller';
import { PaymentMethodSchema } from './schemas/payment.schema';
import { CouponSchema } from 'src/modules/coupon/schemas/coupon.schema';
import { OrderSchema } from 'src/modules/order/schemas/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
		  { name: 'PaymentMethod', schema: PaymentMethodSchema },
		  { name: 'Coupon', schema: CouponSchema },
		  { name: 'Order', schema: OrderSchema },
    ])
  ],
  providers: [PaymentMethodService],
  controllers: [PaymentMethodController],
  exports: [MongooseModule, PaymentMethodService]
})
export class PaymentMethodModule {}
