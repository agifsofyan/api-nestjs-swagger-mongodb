import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

//import { AuthModule } from '../auth/auth.module';

import { FollowupService } from './followup.service';
import { FollowupController } from './followup.controller';
import { FollowUpSchema } from './schemas/followup.schema';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
      MongooseModule.forFeature([
	{ name: 'FollowUp', schema: FollowUpSchema },
	//{ name: 'User', schema: UserSchema }
      ]),
      //AuthModule,
      //TopicModule,
      UserModule
  ],
  providers: [FollowupService],
  controllers: [FollowupController]
})
export class FollowupModule {}
