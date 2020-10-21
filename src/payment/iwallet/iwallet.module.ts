import { Module, HttpModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IwalletService } from './iwallet.service';
import { IwalletController } from './iwallet.controller';
import { IWalletSchema } from './schemas/iwallet.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
		  { name: 'IWallet', schema: IWalletSchema },
    ]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [IwalletService],
  controllers: [IwalletController]
})
export class IwalletModule {}
