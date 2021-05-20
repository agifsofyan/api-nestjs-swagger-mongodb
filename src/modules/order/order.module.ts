import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';

import { OrderController } from './order.controller';
import { OrderService } from './services/order.service';
import { OrderNotifyService } from './services/notify.service';
import { OrderCrudService } from './services/crud.service';
import { OrderSchema } from './schemas/order.schema';

import { ProductModule } from '../product/product.module';
import { CartModule } from '../cart/cart.module';
import { PaymentModule } from '../payment/payment.module';
import { ShipmentModule } from '../shipment/shipment.module';

import { CouponModule } from '../coupon/coupon.module';
import { MailModule } from '../mail/mail.module';
import { CronModule } from '../cron/cron.module';
import { UserModule } from '../user/user.module';
import { ProfileModule } from '../profile/profile.module';
import { FollowupModule } from '../followup/followup.module';
import { TemplatesModule } from '../templates/templates.module';
import { BankTransferSchema } from '../payment/banktransfer/schemas/banktransfer.schema';
import { DanaSchema } from '../payment/dana/schemas/dana.schema';
import { ContentModule } from '../content/content.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Order', schema: OrderSchema },
      { name: 'BankTransfer', schema: BankTransferSchema },
      { name: 'Dana', schema: DanaSchema },
    ]),
    AuthModule,
    CartModule,
    ProductModule,
    PaymentModule,
    ShipmentModule,
    CouponModule,
    MailModule,
    CronModule,
    forwardRef(() => UserModule),
    FollowupModule,
    TemplatesModule,
    ProfileModule
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderNotifyService, OrderCrudService],
  exports: [MongooseModule, OrderService, OrderNotifyService, OrderCrudService]
})
export class OrderModule {}
