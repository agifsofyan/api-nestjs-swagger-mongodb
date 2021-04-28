import { Module } from '@nestjs/common';
import { LMSService } from './lms.service';
import { LMSController } from './lms.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProductScema } from '../userproducts/schemas/userproducts.schema';
import { ProductModule } from '../product/product.module';
import { ReviewModule } from '../review/review.module';
import { ContentModule } from '../content/content.module';
import { CommentModule } from '../comment/comment.module';
import { VideosModule } from '../videos/videos.module';
import { ProfileModule } from '../profile/profile.module';
import { RatingModule } from '../rating/rating.module';
import { ShipmentModule } from '../shipment/shipment.module';
import { GeneralSettingsModule } from '../general-settings/general-settings.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'UserProduct', schema: UserProductScema }
    ]),
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
  exports: [MongooseModule, LMSService]
})
export class LMSModule {}
