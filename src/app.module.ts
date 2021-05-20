import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LogsMiddleware } from './modules/common/middlewares/logs.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ProfileModule } from './modules/profile/profile.module';
import { ProductModule } from './modules/product/product.module';
import { TopicModule } from './modules/topic/topic.module';
import { CartModule } from './modules/cart/cart.module';
import { MONGO_DB_CONNECTION } from './config/configuration';
import { OrderModule } from './modules/order/order.module';
import { RajaongkirModule } from './modules/rajaongkir/rajaongkir.module';
import { PaymentMethodModule } from './modules/payment/method/method.module';
import { ShipmentModule } from './modules/shipment/shipment.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { LoggerModule } from './modules/logger/logger.module';
import { AdministratorModule } from './modules/administrator/administrator.module';
import { FollowupModule } from './modules/followup/followup.module';
import { UploadModule } from './modules/upload/upload.module';

import { AgentModule } from './modules/agent/agent.module';
import { TagsModule } from './modules/tag/tag.module';
import { MailModule } from './modules/mail/mail.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { DanaModule } from './modules/payment/dana/dana.module';
// import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './modules/cron/cron.service';
import { CronModule } from './modules/cron/cron.module';
import { TokenModule } from './modules/token/token.module';
import { BanktransferModule } from './modules/payment/banktransfer/banktransfer.module';
import { XenditModule } from './modules/payment/xendit/xendit.module';
import { RatingModule } from './modules/rating/rating.module';
import { ReviewModule } from './modules/review/review.module';
import { CommentModule } from './modules/comment/comment.module';
import { GeneralSettingsModule } from './modules/general-settings/general-settings.module';
import { VideosModule } from './modules/videos/videos.module';
import { LMSModule } from './modules/LMS/lms.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { ActivityModule } from './modules/activity/activity.module';
import { ContentModule } from './modules/content/content.module';

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
    DanaModule,
    CronModule,
    TokenModule,
    BanktransferModule,
    XenditModule,
    RatingModule,
    ReviewModule,
    CommentModule,
    GeneralSettingsModule,
    VideosModule,
    LMSModule,
    GamificationModule,
    ActivityModule,
    // ZoomModule,
    //ScheduleModule.forRoot() // Cron Job
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
