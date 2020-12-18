import { Module, HttpModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { ProfileSchema } from './schemas/profile.schema';
import { RajaongkirService } from '../rajaongkir/rajaongkir.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Profile', schema: ProfileSchema }
    ]),
    HttpModule
  ],
  providers: [ProfileService, RajaongkirService],
  controllers: [ProfileController],
  exports: [MongooseModule, RajaongkirService]
})
export class ProfileModule {}
