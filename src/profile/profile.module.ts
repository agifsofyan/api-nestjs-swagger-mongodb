import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { ProfileSchema } from './schemas/profile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Profile', schema: ProfileSchema }
    ])
  ],
  providers: [ProfileService],
  controllers: [ProfileController],
  exports: [MongooseModule]
})
export class ProfileModule {}
