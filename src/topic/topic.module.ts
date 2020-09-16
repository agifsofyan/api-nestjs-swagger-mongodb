import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TopicService } from './topic.service';
import { TopicController } from './topic.controller';
import { TopicSchema } from './schemas/topic.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Topic', schema: TopicSchema }
    ])
  ],
  providers: [TopicService],
  controllers: [TopicController]
})
export class TopicModule {}
