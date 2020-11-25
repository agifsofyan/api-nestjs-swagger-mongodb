import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { UserSchema } from './schemas/user.schema';
import { ProfileModule } from '../profile/profile.module';
import { ProfileService } from '../profile/profile.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
    ]),
    AuthModule,
    ProfileModule
  ],
  controllers: [UserController],
  providers: [UserService, AuthService, ProfileService],
  exports: [MongooseModule, ProfileModule, ProfileService, UserService]
})
export class UserModule {}
