import { Module, HttpModule, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { ProfileSchema } from './schemas/profile.schema';
import { RajaongkirService } from '../rajaongkir/rajaongkir.service';
import { UserModule } from '../user/user.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Profile', schema: ProfileSchema }
    ]),
    HttpModule,
    forwardRef(() => UserModule),
    MailModule
  ],
  providers: [ProfileService, RajaongkirService],
  controllers: [ProfileController],
  exports: [MongooseModule, RajaongkirService]
})
export class ProfileModule {}
