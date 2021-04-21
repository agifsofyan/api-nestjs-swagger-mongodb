import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';

import { ProductController } from './product.controller';
import { ProductService } from './services/product.service';
import { ProductSchema } from './schemas/product.schema';

import { TopicSchema } from '../topic/schemas/topic.schema';

import { AdminSchema } from '../administrator/schemas/admin.schema';
import { ProductCrudService } from './services/product.crud.service';
import { OrderSchema } from '../order/schemas/order.schema';
import { CouponSchema } from '../coupon/schemas/coupon.schema';
import { ContentSchema } from '../content/schemas/content.schema';
import { TagSchema } from '../tag/schemas/tag.schema';
import { TagService } from '../tag/tag.service';
import { TagsModule } from '../tag/tag.module';
import { RatingModule } from '../rating/rating.module';
import { ProductContentService } from './services/product.content.service';
import { CommentModule } from '../comment/comment.module';
import { ReviewModule } from '../review/review.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Product', schema: ProductSchema },
			{ name: 'Topic', schema: TopicSchema },
			{ name: 'Admin', schema: AdminSchema },
			{ name: 'Order', schema: OrderSchema },
			{ name: 'Coupon', schema: CouponSchema },
			{ name: 'Content', schema: ContentSchema },
			{ name: 'Tag', schema: TagSchema },
		]),
		AuthModule,
		TagsModule,
		CommentModule,
		forwardRef(() => RatingModule),
		forwardRef(() => ReviewModule)
	],
	controllers: [ProductController],
	providers: [ProductService, ProductCrudService, ProductContentService, TagService],
	exports: [MongooseModule, ProductService, ProductCrudService, ProductContentService]
})
export class ProductModule {}
