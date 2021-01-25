import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FollowupService } from './followup.service';
import { FollowupController } from './followup.controller';
import { FollowUpSchema } from './schemas/followup.schema';
import { AdministratorModule } from '../administrator/administrator.module';

@Module({
  imports: [
      MongooseModule.forFeature([
        { name: 'FollowUp', schema: FollowUpSchema }
      ]),
      AdministratorModule
  ],
  providers: [FollowupService],
  controllers: [FollowupController]
})
export class FollowupModule {}
