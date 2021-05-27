import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContentController } from './content.controller';
import { TopicSchema } from '../topic/schemas/topic.schema';
import { TagsModule } from '../tag/tag.module';
import { ProductModule } from '../product/product.module';
import { CommentModule } from '../comment/comment.module';
import { VideoSchema } from '../videos/schemas/videos.schema';
import { BlogSchema } from './blog/schemas/blog.schema';
import { FulfillmentSchema } from './fulfillment/schemas/fulfillment.schema';
import { BlogService } from './blog/blog.service';
import { FulfillmentService } from './fulfillment/fulfillment.service';
import { CommentSchema } from '../comment/schemas/comment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Blog', schema: BlogSchema },
      { name: 'Fulfillment', schema: FulfillmentSchema },
      { name: 'Topic', schema: TopicSchema },
      { name: 'VideoSchema', schema: VideoSchema }
    ]),
    ProductModule,
    TagsModule,
    CommentModule,
    //forwardRef(() => VideosModule)
	],
  controllers: [ContentController],
  providers: [MongooseModule, BlogService, FulfillmentService],
  exports: [MongooseModule, BlogService, FulfillmentService]
})
export class ContentModule {}
