import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { UserSchema } from './schemas/user.schema';
import { ProfileModule } from '../profile/profile.module';
import { ProfileService } from '../profile/profile.service';
import { MailService } from '../mail/mail.service';
import { TemplatesModule } from '../templates/templates.module';
import { UploadModule } from '../upload/upload.module';
import { RoleModule } from '../role/role.module';
import { GeneralSettingsModule } from '../general-settings/general-settings.module';
import { CartModule } from '../cart/cart.module';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema }
    ]),
    AuthModule,
    ProfileModule,
    TemplatesModule,
    UploadModule,
    RoleModule,
    GeneralSettingsModule,
    CartModule,
    OrderModule
  ],
  controllers: [UserController],
  providers: [UserService, AuthService, ProfileService, MailService],
  exports: [MongooseModule, ProfileModule, ProfileService, UserService]
})
export class UserModule {}
