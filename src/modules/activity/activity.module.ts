import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivitySchema } from './schemas/activity.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Activity', schema: ActivitySchema }
    ]),
  ],
  providers: [ActivityService],
  controllers: [ActivityController],
  exports: [MongooseModule, ActivityService]
})
export class ActivityModule {}
