import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';

import { OrderController } from './order.controller';
import { OrderService } from './services/order.service';
import { UserOrderService } from './services/userorder.service';
import { CRUDService } from './services/crud.service';
import { OrderSchema } from './schemas/order.schema';

import { ProductModule } from '../product/product.module';
import { CartModule } from '../cart/cart.module';
import { PaymentMethodModule } from '../payment/method/method.module';
import { PaymentModule } from '../payment/payment.module';
import { ShipmentModule } from '../shipment/shipment.module';

import { CouponModule } from '../coupon/coupon.module';
import { MailModule } from '../mail/mail.module';
import { CronService } from '../cron/cron.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Order', schema: OrderSchema }
    ]),
    AuthModule,
    CartModule,
    ProductModule,
    PaymentMethodModule,
    PaymentModule,
    ShipmentModule,
    CouponModule,
    MailModule
  ],
  controllers: [OrderController],
  providers: [OrderService, UserOrderService, CRUDService, CronService]
})
export class OrderModule {}
