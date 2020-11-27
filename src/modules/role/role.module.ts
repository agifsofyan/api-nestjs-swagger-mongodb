import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminSchema } from '../administrator/schemas/admin.schema';

import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { RoleSchema } from './schemas/role.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
      { name: 'Role', schema: RoleSchema },
      { name: 'Admin', schema: AdminSchema }
    ]),
	],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [MongooseModule, RoleService]
})
export class RoleModule {}
