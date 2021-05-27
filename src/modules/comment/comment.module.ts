import { Module, forwardRef } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentSchema } from './schemas/comment.schema';
import { BlogSchema } from '../content/blog/schemas/blog.schema';
import { FulfillmentSchema } from '../content/fulfillment/schemas/fulfillment.schema';
import { VideoSchema } from '../videos/schemas/videos.schema';
import { ProductSchema } from '../product/schemas/product.schema';

@Module({
  imports: [
	MongooseModule.forFeature([
      		{ name: 'Comment', schema: CommentSchema },
      		{ name: 'Blog', schema: BlogSchema },
      		{ name: 'Fulfillment', schema: FulfillmentSchema },
      		{ name: 'Video', schema: VideoSchema },
		{ name: 'Product', schema: ProductSchema }
    	]),
  ],
  providers: [CommentService],
  controllers: [CommentController],
  exports: [MongooseModule, CommentService]
})
export class CommentModule {}
