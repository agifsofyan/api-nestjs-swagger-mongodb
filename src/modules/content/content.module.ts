import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { ContentSchema } from './schema/content.schema';

import { TopicModule } from '../topic/topic.module';
import { TopicService } from '../topic/topic.service';
import { TopicSchema } from '../topic/schema/topic.schema';

import { ProductModule } from '../product/product.module';
import { ProductService } from '../product/product.service';
import { ProductSchema } from '../product/schema/product.schema';

import { UserModule } from '../user/user.module';
// import { UserService } from '../user/user.service';
// import { UserSchema } from '../user/schema/user.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
      { name: 'Content', schema: ContentSchema },
      { name: 'Topic', schema: TopicSchema },
      { name: 'Product', schema: ProductSchema },
      // { name: 'User', schema: UserSchema },
    ]),
    AuthModule,
    TopicModule,
    ProductModule,
    UserModule
	],
  controllers: [ContentController],
  providers: [ContentService, TopicService, ProductService]
})
export class ContentModule {}
