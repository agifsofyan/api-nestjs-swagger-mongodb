import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

import { CartSchema, CartItemSchema } from './schemas/cart.schema';
import { OrderSchema } from '../order/schemas/order.schema';

import { ProductModule } from '../product/product.module';
import { UserModule } from '../user/user.module';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    MongooseModule.forFeature([
		{ name: 'Cart', schema: CartSchema },
		{ name: 'CartItem', schema: CartItemSchema },
		{ name: 'Order', schema: OrderSchema },
    ]),
    UserModule,
    ProductModule,
    OrderModule
  ],
  controllers: [CartController],
  providers: [CartService]
})
export class CartModule {}
