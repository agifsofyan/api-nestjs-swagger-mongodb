import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { SharedModule } from './common/shared.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProfileModule } from './profile/profile.module';
import { CartModule } from './cart/cart.module';
import { MONGO_DB_CONNECTION } from './config/configuration';
import { ProductModule } from './product/product.module';
import { TopicModule } from './topic/topic.module';

@Module({
  imports: [
    MONGO_DB_CONNECTION,
    // SharedModule,
    AuthModule,
    UserModule,
    ProfileModule,
    ProductModule,
    CartModule,
    TopicModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
