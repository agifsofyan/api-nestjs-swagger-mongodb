import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentSchema } from './schemas/comment.schema';
import { ContentModule } from '../content/content.module';
import { ContentSchema } from '../content/schemas/content.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
      { name: 'Comment', schema: CommentSchema },
      { name: 'Content', schema: ContentSchema },
    ]),
	],
  providers: [CommentService],
  controllers: [CommentController],
  exports: [MongooseModule, CommentService]
})
export class CommentModule {}
