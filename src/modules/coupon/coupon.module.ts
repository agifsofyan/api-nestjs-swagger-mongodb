import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentModule } from '../payment/payment.module';
import { ProductModule } from '../product/product.module';
import { TagsModule } from '../tag/tag.module';

import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { CouponSchema } from './schemas/coupon.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
      { name: 'Coupon', schema: CouponSchema }
    ]),
    TagsModule,
    ProductModule,
    PaymentModule
	],
  controllers: [CouponController],
  providers: [CouponService],
  exports: [MongooseModule, CouponService]
})
export class CouponModule {}
