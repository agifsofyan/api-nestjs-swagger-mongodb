import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { ContentSchema } from './schemas/content.schema';

import { TopicModule } from '../topic/topic.module';
import { TopicSchema } from '../topic/schemas/topic.schema';

import { ProductModule } from '../product/product.module';
import { ProductSchema } from '../product/schemas/product.schema';

import { UserModule } from '../user/user.module';

@Module({
  imports: [
		MongooseModule.forFeature([
      { name: 'Content', schema: ContentSchema },
      { name: 'Topic', schema: TopicSchema },
      { name: 'Product', schema: ProductSchema }
    ]),
    AuthModule,
    TopicModule,
    ProductModule,
    UserModule
	],
  controllers: [ContentController],
  providers: [ContentService]
})
export class ContentModule {}
