import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AdministratorService } from './administrator.service';
import { AdministratorController } from './administrator.controller';
import { AdminSchema } from './schemas/admin.schema';
import { RoleSchema } from '../role/schemas/role.schema';
import { RoleModule } from '../role/role.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Admin', schema: AdminSchema }
    ]),
    AuthModule,
    RoleModule,
  ],
  providers: [AdministratorService],
  controllers: [AdministratorController],
  exports: [MongooseModule, AdministratorService]
})
export class AdministratorModule {}