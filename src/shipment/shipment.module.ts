import { Module, HttpModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShipmentService } from './shipment.service';
import { ShipmentController } from './shipment.controller';
import { ShipmentSchema } from './schemas/shipment.schema';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    MongooseModule.forFeature([
		{ name: 'Shipment', schema: ShipmentSchema }
    ]),
    UserModule
  ],
  providers: [ShipmentService],
  controllers: [ShipmentController]
})
export class ShipmentModule {}
