import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';

import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductSchema } from './schemas/product.schema';

import { TopicModule } from '../topic/topic.module';
import { TopicService } from '../topic/topic.service';
import { TopicSchema } from '../topic/schemas/topic.schema';

import { AdministratorModule } from '../administrator/administrator.module';
import { AdministratorService } from '../administrator/administrator.service';
import { AdminSchema } from '../administrator/schemas/admin.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Product', schema: ProductSchema },
			{ name: 'Topic', schema: TopicSchema },
			{ name: 'Admin', schema: AdminSchema }
		]),
		AuthModule,
		TopicModule,
		AdministratorModule
	],
	controllers: [ProductController],
	providers: [ProductService, TopicService, AdministratorService],
	exports: [MongooseModule, ProductService]
})
export class ProductModule {}
