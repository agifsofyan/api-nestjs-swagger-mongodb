import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { LogsMiddleware } from './modules/common/middlewares/logs.middleware';

// import { SharedModule } from './common/shared.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ProfileModule } from './modules/profile/profile.module';
import { ProductModule } from './modules/product/product.module';
import { TopicModule } from './modules/topic/topic.module';
// import { CartModule } from './cart/cart.module';
import { CartModule } from './modules/cart/cart.module';
import { MONGO_DB_CONNECTION } from './config/configuration';
// import { OrderModule } from './order/order.module';
import { OrderModule } from './modules/order/order.module';
import { RajaongkirModule } from './modules/rajaongkir/rajaongkir.module';

// import { ProvinceModule } from './provinces/province.module';
// import { SubdistrictModule } from './subdistricts/subdistrict.module';

import { PaymentMethodModule } from './modules/payment/method/method.module';
import { ShipmentModule } from './modules/shipment/shipment.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { LoggerModule } from './modules/logger/logger.module';
import { AdministratorModule } from './modules/administrator/administrator.module';

import { ContentModule } from './modules/content/content.module';
import { FollowupModule } from './modules/followup/followup.module';
import { UploadModule } from './modules/upload/upload.module';

import { AgentModule } from './modules/agent/agent.module';
import { TagsModule } from './modules/tag/tag.module';
import { MailModule } from './modules/mail/mail.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { DanaModule } from './modules/dana/dana.module';

@Module({
  imports: [
    MONGO_DB_CONNECTION,
    AgentModule,
    AuthModule,
    AdministratorModule,
    UserModule,
    CartModule,
    ContentModule,
    CouponModule,
    FollowupModule,
    TagsModule,
    LoggerModule,
    MailModule,
    OrderModule,
    PaymentMethodModule,
    ProductModule,
    ProfileModule,
    RajaongkirModule,
    ShipmentModule,
    TopicModule,
    UploadModule,
    TemplatesModule,
    DanaModule
    // ProvinceModule,
    // SubdistrictModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
// export class AppModule {}
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    const log = process.env.LOG
    
    if(log == 'true'){
    	consumer.apply(LogsMiddleware).forRoutes('products');
    }else{
	consumer.apply(LogsMiddleware);
    }
  }
}
