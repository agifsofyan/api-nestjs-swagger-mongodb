import { Module } from '@nestjs/common';
import { RatingService } from './rating.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RatingSchema } from './schemas/rating.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
      { name: 'Rating', schema: RatingSchema }
    ])
	],
  providers: [RatingService],
  exports: [MongooseModule, RatingService]
})
export class RatingModule {}
