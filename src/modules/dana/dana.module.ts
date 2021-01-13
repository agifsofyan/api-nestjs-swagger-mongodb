import { Module, HttpModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenSchema } from '../token/schemas/token.schema';
import { DanaController } from './dana.controller';
import { DanaService } from './dana.service';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: 'Token', schema: TokenSchema }
    ]),
  ],
  controllers: [DanaController],
  providers: [DanaService]
})
export class DanaModule {}
