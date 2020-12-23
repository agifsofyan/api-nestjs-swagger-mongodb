import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentMethodSchema } from '../payment/method/schemas/payment.schema';
import { ProductSchema } from '../product/schemas/product.schema';
import { TagsModule } from '../tag/tag.module';

import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { CouponSchema } from './schemas/coupon.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
      { name: 'Coupon', schema: CouponSchema },
      { name: 'Product', schema: ProductSchema },
      { name: 'PaymentMethod', schema: PaymentMethodSchema },
    ]),
    TagsModule
	],
  controllers: [CouponController],
  providers: [CouponService],
  exports: [MongooseModule, CouponService]
})
export class CouponModule {}
