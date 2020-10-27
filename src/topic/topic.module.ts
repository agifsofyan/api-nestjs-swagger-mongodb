import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TopicService } from './topic.service';
import { TopicController } from './topic.controller';
import { TopicSchema } from './schemas/topic.schema';
import { AuthService } from '../auth/auth.service';
import { AuthModule } from '../auth/auth.module';
//import { UserModule } from '../user/user.module';
import { UserSchema } from '../user/schemas/user.schema';
import { RefreshTokenSchema } from '../auth/schemas/refresh-token.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Topic', schema: TopicSchema },
      { name: 'User', schema: UserSchema },
      { name: 'RefreshToken', schema: RefreshTokenSchema }
    ]),
    //UserModule,
    AuthModule
  ],
  providers: [TopicService, AuthService],
  controllers: [TopicController]
})
export class TopicModule {}
