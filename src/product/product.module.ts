import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// import { UserController } from './user.controller';
// import { UserService } from './user.service';
import { ProductSchema } from './schemas/product.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
          { name: 'Product', schema: ProductSchema }
        ])
      ],
    //   controllers: [UserController],
    //   providers: [UserService]
    })
})
export class ProductModule {}
