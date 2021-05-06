import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileSchema } from '../profile/schemas/profile.schema';
import { ActivitySchema } from './schemas/activity.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Activity', schema: ActivitySchema },
      { name: 'Profile', schema: ProfileSchema },
    ]),
  ],
  providers: [ActivityService],
  controllers: [ActivityController],
  exports: [MongooseModule, ActivityService]
})
export class ActivityModule {}
