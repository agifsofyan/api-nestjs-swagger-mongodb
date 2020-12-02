import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { HashTagController } from './hashtag.controller';
import { HashTagService } from './hashtag.service';
import { HashTagSchema } from './schemas/hashtag.schema';
import { ContentSchema } from '../content/schemas/content.schema';
import { ProductSchema } from '../product/schemas/product.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
      { name: 'HashTag', schema: HashTagSchema },
      { name: 'Content', schema: ContentSchema },
      { name: 'Product', schema: ProductSchema }
    ]),
		AuthModule
	],
  controllers: [HashTagController],
  providers: [HashTagService],
  exports: [MongooseModule, HashTagService]
})
export class HashtagsModule {}
