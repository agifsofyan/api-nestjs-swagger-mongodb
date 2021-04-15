import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentSchema } from './schemas/comment.schema';
import { ContentSchema } from '../content/schemas/content.schema';
import { VideoSchema } from '../videos/schemas/videos.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
      { name: 'Comment', schema: CommentSchema },
      { name: 'Content', schema: ContentSchema },
      { name: 'Video', schema: VideoSchema },
    ]),
	],
  providers: [CommentService],
  controllers: [CommentController],
  exports: [MongooseModule, CommentService]
})
export class CommentModule {}
