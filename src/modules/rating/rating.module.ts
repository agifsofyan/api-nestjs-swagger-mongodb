import { Module } from '@nestjs/common';
import { RatingService } from './rating.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RatingSchema } from './schemas/rating.schema';
import { RatingController } from './rating.controller';

@Module({
  imports: [
		MongooseModule.forFeature([
      { name: 'Rating', schema: RatingSchema }
    ])
	],
  providers: [RatingService],
  controllers: [RatingController],
  exports: [MongooseModule, RatingService]
})
export class RatingModule {}
