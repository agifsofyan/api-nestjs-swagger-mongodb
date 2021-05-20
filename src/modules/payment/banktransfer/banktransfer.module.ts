import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BanktransferService } from './banktransfer.service';
import { BanktransferController } from './banktransfer.controller';
import { BankTransferSchema } from './schemas/banktransfer.schema';
import { OrderModule } from 'src/modules/order/order.module';
import { MailModule } from '../../mail/mail.module';
import { PaymentMethodSchema } from '../method/schemas/payment.schema';
import { ContentModule } from 'src/modules/content/content.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'BankTransfer', schema: BankTransferSchema },
      { name: 'PaymentMethod', schema: PaymentMethodSchema },
    ]),
    OrderModule,
    ContentModule,
    MailModule
  ],
  providers: [BanktransferService],
  controllers: [BanktransferController]
})
export class BanktransferModule {}
