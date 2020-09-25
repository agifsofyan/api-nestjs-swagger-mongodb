import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { XenditModule } from '../xendit/xendit.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderSchema } from './schemas/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Order', schema: OrderSchema }
    ]),
    XenditModule
  ],
  controllers: [OrderController],
  providers: [OrderService]
})
export class OrderModule {}
