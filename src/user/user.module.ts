import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserSchema } from './schemas/user.schema';
import { ProfileModule } from '../profile/profile.module';
import { ProfileService } from '../profile/profile.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema }
    ]),
    AuthModule,
    ProfileModule
  ],
  controllers: [UserController],
  providers: [UserService, ProfileService],
  exports: [MongooseModule]
})
export class UserModule {}
