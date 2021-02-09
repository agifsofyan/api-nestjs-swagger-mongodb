import { Module } from '@nestjs/common';
import { UsercontainService } from './usercontain.service';
import { UsercontainController } from './usercontain.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserContainSchema } from './schemas/usercontain.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'UserContain', schema: UserContainSchema }
    ])
  ],
  providers: [UsercontainService],
  controllers: [UsercontainController]
})
export class UsercontainModule {}
