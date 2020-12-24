import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';
import { TagSchema } from './schemas/tag.schema';
import { ContentSchema } from '../content/schemas/content.schema';
import { ProductSchema } from '../product/schemas/product.schema';
import { OrderSchema } from '../order/schemas/order.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
      { name: 'Tag', schema: TagSchema },
      { name: 'Content', schema: ContentSchema },
      { name: 'Product', schema: ProductSchema },
      { name: 'Order', schema: OrderSchema },
    ]),
    AuthModule
	],
  controllers: [TagController],
  providers: [TagService],
  exports: [MongooseModule, TagService]
})
export class TagsModule {}
