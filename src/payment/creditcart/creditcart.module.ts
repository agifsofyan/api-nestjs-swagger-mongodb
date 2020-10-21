import { Module, HttpModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CreditcartService } from './creditcart.service';
import { CreditcartController } from './creditcart.controller';
import { CreditCartSchema } from './schemas/creditcart.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
		  { name: 'CreditCart', schema: CreditCartSchema },
    ]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [CreditcartService],
  controllers: [CreditcartController]
})
export class CreditcartModule {}
