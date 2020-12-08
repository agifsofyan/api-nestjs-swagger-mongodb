import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

//import { AuthModule } from '../auth/auth.module';

import { FollowupService } from './followup.service';
import { FollowupController } from './followup.controller';
import { FollowUpSchema } from './schemas/followup.schema';
import { AdminSchema } from '../administrator/schemas/admin.schema';

@Module({
  imports: [
      MongooseModule.forFeature([
        { name: 'FollowUp', schema: FollowUpSchema },
        { name: 'Admin', schema: AdminSchema }
      ]),
  ],
  providers: [FollowupService],
  controllers: [FollowupController]
})
export class FollowupModule {}
