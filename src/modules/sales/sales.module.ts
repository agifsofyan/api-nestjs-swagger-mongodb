import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalesService } from './services/sales.service';
import { UTMService } from './services/utm.service';
import { SalesController } from './sales.controller';
import { UTMSchema } from './schemas/utm.schema';
import { HotService } from './services/hot.service';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
		MongooseModule.forFeature([
      { name: 'UTM', schema: UTMSchema },
      // { name: 'Sales', schema: SalesSchema },
    ]),
    ProductModule
	],
  providers: [UTMService, SalesService, HotService],
  controllers: [SalesController],
  exports: [MongooseModule, UTMService, SalesService, HotService]
})
export class SalesModule {}
