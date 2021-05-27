import { forwardRef, Module } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { VideoSchema } from './schemas/videos.schema';
import { ProfileModule } from '../profile/profile.module';
import { BlogSchema } from '../content/blog/schemas/blog.schema';
import { FulfillmentSchema } from '../content/fulfillment/schemas/fulfillment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Video', schema: VideoSchema },
      { name: 'Blog', schema: BlogSchema },
      { name: 'Fulfillment', schema: FulfillmentSchema }
    ]),
    ProfileModule,
  ],
  providers: [VideosService],
  controllers: [VideosController],
  exports: [MongooseModule, VideosService]
})
export class VideosModule {}
