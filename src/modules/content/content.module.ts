import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { ContentSchema } from './schemas/content.schema';
import { TopicSchema } from '../topic/schemas/topic.schema';
import { TagsModule } from '../tag/tag.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
		MongooseModule.forFeature([
      { name: 'Content', schema: ContentSchema },
      { name: 'Topic', schema: TopicSchema }
    ]),
    ProductModule,
    TagsModule
	],
  controllers: [ContentController],
  providers: [MongooseModule, ContentService],
  exports: [MongooseModule, ContentService]
})
export class ContentModule {}
