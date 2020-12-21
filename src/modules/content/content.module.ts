import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { ContentSchema } from './schemas/content.schema';
import { TopicSchema } from '../topic/schemas/topic.schema';
import { ProductSchema } from '../product/schemas/product.schema';
import { HashTagService } from '../hashtag/hashtag.service';
import { HashTagsModule } from '../hashtag/hashtag.module';

@Module({
  imports: [
		MongooseModule.forFeature([
      { name: 'Content', schema: ContentSchema },
      { name: 'Topic', schema: TopicSchema },
      { name: 'Product', schema: ProductSchema }
    ]),
    HashTagsModule
	],
  controllers: [ContentController],
  providers: [ContentService, HashTagService]
})
export class ContentModule {}
