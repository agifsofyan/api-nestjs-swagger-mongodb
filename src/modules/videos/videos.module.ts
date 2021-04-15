import { forwardRef, Module } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { VideoSchema } from './schemas/videos.schema';
import { ContentModule } from '../content/content.module';
import { ProfileModule } from '../profile/profile.module';
import { UserproductsModule } from '../userproducts/userproducts.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Video', schema: VideoSchema }
    ]),
    forwardRef(() => ContentModule),
    ProfileModule,
    forwardRef(() => UserproductsModule)
  ],
  providers: [VideosService],
  controllers: [VideosController],
  exports: [MongooseModule, VideosService]
})
export class VideosModule {}
