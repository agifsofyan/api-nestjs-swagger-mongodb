import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { TopicController } from './topic.controller';
import { TopicService } from './topic.service';
import { TopicSchema } from './schemas/topic.schema';
import { ContentSchema } from '../content/schemas/content.schema';
import { ProductSchema } from '../product/schemas/product.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
      { name: 'Topic', schema: TopicSchema },
      { name: 'Content', schema: ContentSchema },
      { name: 'Product', schema: ProductSchema }
    ]),
		AuthModule
	],
  controllers: [TopicController],
  providers: [TopicService],
  exports: [MongooseModule, TopicService]
})
export class TopicModule {}
