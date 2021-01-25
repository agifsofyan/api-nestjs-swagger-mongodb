import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { TopicController } from './topic.controller';
import { TopicService } from './topic.service';
import { TopicSchema } from './schemas/topic.schema';
import { RatingModule } from '../rating/rating.module';
import { ProductModule } from '../product/product.module';
import { ContentModule } from '../content/content.module';

@Module({
  imports: [
		MongooseModule.forFeature([
      { name: 'Topic', schema: TopicSchema }
    ]),
    AuthModule,
    RatingModule,
    ProductModule,
    ContentModule
	],
  controllers: [TopicController],
  providers: [TopicService],
  exports: [MongooseModule, TopicService]
})
export class TopicModule {}
