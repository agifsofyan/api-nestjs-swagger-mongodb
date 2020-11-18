import { Module, HttpModule } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';

@Module({
  imports: [HttpModule],
  providers: [CouponService],
  controllers: [CouponController],
  exports: [HttpModule, CouponService]
})
export class CouponModule {}
