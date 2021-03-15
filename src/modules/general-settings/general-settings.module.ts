import { Module } from '@nestjs/common';
import { GeneralSettingsService } from './general-settings.service';
import { GeneralSettingsController } from './general-settings.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { GeneralSettingSchema } from './schemas/general-settings.schema';
import { Mongoose } from 'mongoose';

@Module({
  imports: [
		MongooseModule.forFeature([
      { name: 'GeneralSetting', schema: GeneralSettingSchema }
    ]),
	],
  providers: [GeneralSettingsService],
  controllers: [GeneralSettingsController],
  exports: [MongooseModule, GeneralSettingsService]
})
export class GeneralSettingsModule {}
