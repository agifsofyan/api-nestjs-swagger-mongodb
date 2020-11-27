import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';

import { ProductController } from './product.controller';
import { ProductService } from './services/product.service';
import { ProductSchema } from './schemas/product.schema';

import { TopicModule } from '../topic/topic.module';
import { TopicService } from '../topic/topic.service';
import { TopicSchema } from '../topic/schemas/topic.schema';

import { AdministratorModule } from '../administrator/administrator.module';
import { AdministratorService } from '../administrator/administrator.service';
import { AdminSchema } from '../administrator/schemas/admin.schema';
import { ProductCrudService } from './services/product.crud.service';
import { OrderSchema } from '../order/schemas/order.schema';
import { CouponSchema } from '../coupon/schemas/coupon.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Product', schema: ProductSchema },
			{ name: 'Topic', schema: TopicSchema },
			{ name: 'Admin', schema: AdminSchema },
			{ name: 'Order', schema: OrderSchema },
			{ name: 'Coupon', schema: CouponSchema },
		]),
		AuthModule,
		TopicModule,
		AdministratorModule
	],
	controllers: [ProductController],
	providers: [ProductService, ProductCrudService, TopicService, AdministratorService],
	exports: [MongooseModule, ProductService, ProductCrudService]
})
export class ProductModule {}
