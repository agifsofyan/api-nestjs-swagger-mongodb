import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

import { CartSchema } from './schemas/cart.schema';

import { ProductModule } from '../product/product.module';
import { UserModule } from '../user/user.module';

import { ProfileModule } from '../profile/profile.module';
import { ProfileService } from '../profile/profile.service';

@Module({
  imports: [
    MongooseModule.forFeature([
		{ name: 'Cart', schema: CartSchema }
    ]),
    forwardRef(() => UserModule),
    ProductModule,
    ProfileModule
  ],
  controllers: [CartController],
  providers: [CartService, ProfileService],
  exports: [MongooseModule, CartService]
})
export class CartModule {}
