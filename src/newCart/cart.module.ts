import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

import { CartSchema, CartItemSchema } from './schemas/cart.schema';

import { ProductModule } from '../product/product.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
		{ name: 'Cart', schema: CartSchema },
		{ name: 'CartItem', schema: CartItemSchema },
    ]),
    UserModule,
    ProductModule
  ],
  controllers: [CartController],
  providers: [CartService]
})
export class CartModule {}
