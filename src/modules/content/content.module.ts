import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { ContentSchema } from './schemas/content.schema';
import { TopicSchema } from '../topic/schemas/topic.schema';
import { TagsModule } from '../tag/tag.module';
import { ProductModule } from '../product/product.module';
import { CommentModule } from '../comment/comment.module';
import { VideosModule } from '../videos/videos.module';
import { BlogSchema } from './blog/schemas/blog.schema';
import { FulfillmentSchema } from './fulfillment/schemas/fulfillment.schema';
import { BlogService } from './blog/blog.service';
import { FulfillmentService } from './fulfillment/fulfillment.service';

@Module({
  imports: [
		MongooseModule.forFeature([
      { name: 'Content', schema: ContentSchema },
      { name: 'Blog', schema: BlogSchema },
      { name: 'Fulfillment', schema: FulfillmentSchema },
      { name: 'Topic', schema: TopicSchema },
    ]),
    ProductModule,
    TagsModule,
    CommentModule,
    forwardRef(() => VideosModule)
	],
  controllers: [ContentController],
  providers: [MongooseModule, ContentService, BlogService, FulfillmentService],
  exports: [MongooseModule, ContentService, BlogService, FulfillmentService]
})
export class ContentModule {}
