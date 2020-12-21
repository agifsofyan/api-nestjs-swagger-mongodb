import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { ContentSchema } from '../content/schemas/content.schema';
import { ProductSchema } from '../product/schemas/product.schema';
import { HashTagSchema } from './schemas/hashtag.schema';
import { HashTagController } from './hashtag.controller';
import { HashTagService } from './hashtag.service';

@Module({
  imports: [
		MongooseModule.forFeature([
      { name: 'HashTag', schema: HashTagSchema },
      { name: 'Content', schema: ContentSchema },
      { name: 'Product', schema: ProductSchema }
    ])
	],
  controllers: [HashTagController],
  providers: [HashTagService],
  exports: [MongooseModule, HashTagService]
})
export class HashTagsModule {}
