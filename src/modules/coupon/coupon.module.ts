import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { CouponSchema } from './schemas/coupon.schema';

@Module({
  imports: [
		MongooseModule.forFeature([{ name: 'Coupon', schema: CouponSchema }])
	],
  controllers: [CouponController],
  providers: [CouponService],
  exports: [MongooseModule, CouponService]
})
export class CouponModule {}
