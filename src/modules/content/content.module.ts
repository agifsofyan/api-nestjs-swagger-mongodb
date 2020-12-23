import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { ContentSchema } from './schemas/content.schema';
import { TopicSchema } from '../topic/schemas/topic.schema';
import { ProductSchema } from '../product/schemas/product.schema';
import { TagService } from '../tag/tag.service';
import { TagsModule } from '../tag/tag.module';

@Module({
  imports: [
		MongooseModule.forFeature([
      { name: 'Content', schema: ContentSchema },
      { name: 'Topic', schema: TopicSchema },
      { name: 'Product', schema: ProductSchema }
    ]),
    TagsModule
	],
  controllers: [ContentController],
  providers: [ContentService]
})
export class ContentModule {}
