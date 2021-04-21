import { forwardRef, Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewSchema } from './schemas/review.schema';
import { RatingModule } from '../rating/rating.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Review', schema: ReviewSchema }
    ]),
    RatingModule,
    forwardRef(() => ProductModule)
  ],
  providers: [ReviewService],
  controllers: [ReviewController],
  exports: [MongooseModule, ReviewService]
})
export class ReviewModule {}
