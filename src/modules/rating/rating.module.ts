import { Module } from '@nestjs/common';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RatingSchema } from './schemas/rating.schema';

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
