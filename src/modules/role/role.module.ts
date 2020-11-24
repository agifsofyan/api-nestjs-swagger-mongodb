import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { RoleSchema } from './schemas/role.schema';

@Module({
  imports: [
		MongooseModule.forFeature([{ name: 'Role', schema: RoleSchema }]),
	],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [MongooseModule, RoleService]
})
export class RoleModule {}
