import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';

import { OrderController } from './order.controller';
import { OrderService } from './services/order.service';
import { OrderNotifyService } from './services/notify.service';
import { OrderCrudService } from './services/crud.service';
import { OrderSchema } from './schemas/order.schema';

import { ProductModule } from '../product/product.module';
import { CartModule } from '../cart/cart.module';
import { PaymentMethodModule } from '../payment/method/method.module';
import { PaymentModule } from '../payment/payment.module';
import { ShipmentModule } from '../shipment/shipment.module';

import { CouponModule } from '../coupon/coupon.module';
import { MailModule } from '../mail/mail.module';
import { CronModule } from '../cron/cron.module';
import { PaymentService } from '../payment/payment.service';
import { DanaModule } from '../dana/dana.module';

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
    MailModule,
    CronModule,
    DanaModule
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderNotifyService, OrderCrudService, PaymentService],
  exports: [MongooseModule, OrderService, OrderNotifyService, OrderCrudService]
})
export class OrderModule {}
