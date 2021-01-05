import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { MediaSchema } from './schemas/media.schema';

@Module({
  imports: [
	  MongooseModule.forFeature([{ name: 'Media', schema: MediaSchema }])
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [MongooseModule, UploadService]
})
export class UploadModule {}
