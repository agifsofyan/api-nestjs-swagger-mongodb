import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';

import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductSchema } from './schema/product.schema';

import { TopicModule } from '../topic/topic.module';
import { TopicService } from '../topic/topic.service';
import { TopicSchema } from '../topic/schema/topic.schema';

import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { UserSchema } from '../user/schema/user.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Product', schema: ProductSchema },
			{ name: 'Topic', schema: TopicSchema },
			{ name: 'User', schema: UserSchema }
		]),
		AuthModule,
		TopicModule,
		UserModule
	],
	controllers: [ProductController],
  	providers: [ProductService, TopicService, UserService]
})
export class ProductModule {}
