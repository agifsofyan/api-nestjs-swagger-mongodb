import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AdministratorService } from './administrator.service';
import { AdministratorController } from './administrator.controller';
import { AdminSchema } from './schema/admin.schema';
import { RoleSchema } from 'src/role/schema/role.schema';
import { RoleModule } from 'src/role/role.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Admin', schema: AdminSchema },
      { name: 'Role', schema: RoleSchema }
    ]),
    AuthModule,
    RoleModule,
  ],
  providers: [AdministratorService],
  controllers: [AdministratorController],
  exports: [MongooseModule, AdministratorService]
})
export class AdministratorModule {}