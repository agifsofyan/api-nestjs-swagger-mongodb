import { Module } from '@nestjs/common';
import { UserproductsService } from './userproducts.service';
import { UserproductsController } from './userproducts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProductScema } from './schemas/userproducts.schema';
import { ProductModule } from '../product/product.module';
import { OrderModule } from '../order/order.module';
import { ReviewModule } from '../review/review.module';
import { ContentModule } from '../content/content.module';
import { CommentModule } from '../comment/comment.module';
import { VideosModule } from '../videos/videos.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'UserProduct', schema: UserProductScema }
    ]),
    ProductModule,
    ContentModule,
    ReviewModule,
    CommentModule,
    VideosModule
  ],
  providers: [UserproductsService],
  controllers: [UserproductsController],
  exports: [MongooseModule, UserproductsService]
})
export class UserproductsModule {}
