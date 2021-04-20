import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FollowupService } from './followup.service';
import { FollowupController } from './followup.controller';
import { FollowUpSchema } from './schemas/followup.schema';
import { AdministratorModule } from '../administrator/administrator.module';
import { ProfileModule } from '../profile/profile.module';
import { OrderModule } from '../order/order.module';
import { TemplatesModule } from '../templates/templates.module';

@Module({
  imports: [
      MongooseModule.forFeature([
        { name: 'FollowUp', schema: FollowUpSchema }
      ]),
      AdministratorModule,
      ProfileModule,
      forwardRef(() => OrderModule),
      TemplatesModule
  ],
  providers: [FollowupService],
  controllers: [FollowupController],
  exports: [MongooseModule, FollowupService]
})
export class FollowupModule {}
