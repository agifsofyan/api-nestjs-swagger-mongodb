import { Module } from '@nestjs/common';
import { UserproductsService } from './userproducts.service';
import { UserproductsController } from './userproducts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProductScema } from './schemas/userproducts.schema';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'UserProduct', schema: UserProductScema }
    ]),
    ProductModule
  ],
  providers: [UserproductsService],
  controllers: [UserproductsController],
  exports: [MongooseModule, UserproductsService]
})
export class UserproductsModule {}
