import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { UserSchema } from '../user/schemas/user.schema';
import { RefreshTokenSchema } from './schemas/refresh-token.schema';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserStrategy } from './strategies/user.strategy';
import { JWT_EXPIRATION_TIME, JWT_SECRET_KEY } from '../config/configuration';
import { SessionSerializer } from './session.serializer';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'RefreshToken', schema: RefreshTokenSchema }
    ]),
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: true,
    }),
    JwtModule.register({
      secret: JWT_SECRET_KEY,
      signOptions: { expiresIn: JWT_EXPIRATION_TIME },
    }),
    // SharedModule,
  ],
  providers: [AuthService, JwtStrategy, UserStrategy, SessionSerializer],
  exports: [AuthService, PassportModule, MongooseModule]
})
export class AuthModule {}
