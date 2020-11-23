import { Module, HttpModule } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';

import { OrderController } from './order.controller';

@Module({
  imports: [
		// MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }]),
	HttpModule.register({
		timeout: 5000,
		maxRedirects: 5
	})
  ],
  controllers: [OrderController]
})
export class OrderModule {}
