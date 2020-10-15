import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartSchema } from './schema/cart.schema';

import { ProductModule } from '../product/product.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
		  { name: 'Cart', schema: CartSchema }
    ]),
    UserModule,
    ProductModule
  ],
  controllers: [CartController],
  providers: [CartService]
})
export class CartModule {}
