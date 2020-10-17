import { Module, HttpModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductSchema } from './schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Product', schema: ProductSchema },
    ]),
    HttpModule.register({
<<<<<<< HEAD
      timeout: 5000,
      maxRedirects: 5
    })
=======
		timeout: 5000,
		maxRedirects: 5
	})
>>>>>>> a6180e6... merge local
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [MongooseModule]
})
export class ProductModule {}
