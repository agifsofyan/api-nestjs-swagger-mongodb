import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { MediaSchema } from './schemas/media.schema';
//import { Multer_AWS } from 'src/config/multer.configuration';

@Module({
  imports: [
	MongooseModule.forFeature([{ name: 'Media', schema: MediaSchema }])
  ],
  controllers: [UploadController],
  providers: [UploadService]
})
export class UploadModule {}
