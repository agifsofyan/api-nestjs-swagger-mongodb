import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BanktransferService } from './banktransfer.service';
import { BanktransferController } from './banktransfer.controller';
import { BankTransferSchema } from './schemas/banktransfer.schema';
import { OrderModule } from 'src/modules/order/order.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'BankTransfer', schema: BankTransferSchema }
    ]),
    OrderModule
  ],
  providers: [BanktransferService],
  controllers: [BanktransferController]
})
export class BanktransferModule {}
