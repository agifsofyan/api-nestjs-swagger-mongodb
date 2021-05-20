import { Module } from '@nestjs/common';
import { LMSService } from './lms.service';
import { LMSController } from './lms.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductModule } from '../product/product.module';
import { ReviewModule } from '../review/review.module';
import { CommentModule } from '../comment/comment.module';
import { VideosModule } from '../videos/videos.module';
import { ProfileModule } from '../profile/profile.module';
import { RatingModule } from '../rating/rating.module';
import { ShipmentModule } from '../shipment/shipment.module';
import { GeneralSettingsModule } from '../general-settings/general-settings.module';
import { ContentModule } from '../content/content.module';

@Module({
  imports: [
    ProductModule,
    ContentModule,
    ReviewModule,
    CommentModule,
    VideosModule,
    ProfileModule,
    RatingModule,
    ShipmentModule,
    GeneralSettingsModule
  ],
  providers: [LMSService],
  controllers: [LMSController],
  exports: [LMSService]
})
export class LMSModule {}
