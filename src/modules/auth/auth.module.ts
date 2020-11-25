import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { UserSchema } from '../user/schemas/user.schema';
import { AdminSchema } from '../administrator/schemas/admin.schema';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JWT_EXPIRATION_TIME, JWT_SECRET_KEY } from 'src/config/configuration';
import { SessionSerializer } from './session.serializer';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Admin', schema: AdminSchema },
    ]),
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: true,
    }),
    JwtModule.register({
      secret: JWT_SECRET_KEY,
      signOptions: { expiresIn: JWT_EXPIRATION_TIME },
    })
  ],
  providers: [AuthService, JwtStrategy, SessionSerializer],
  exports: [MongooseModule, AuthService, PassportModule]
})
export class AuthModule {}
