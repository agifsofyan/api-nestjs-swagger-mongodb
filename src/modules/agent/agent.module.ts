import { Module } from '@nestjs/common';

import { AgentController } from './agent.controller';
import { AdministratorService } from '../administrator/administrator.service';
import { RoleService } from '../role/role.service';
import { RoleModule } from '../role/role.module'

import { AdministratorModule } from '../administrator/administrator.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AdministratorModule,
    RoleModule,
    AuthModule
  ],
  controllers: [AgentController],
  providers: [AdministratorService, RoleService]
})
export class AgentModule {}
