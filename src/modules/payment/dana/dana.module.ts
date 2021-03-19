import { Module, HttpModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenSchema } from '../../token/schemas/token.schema';
import { DanaController } from './dana.controller';
import { DanaService } from './dana.service';
import { DanaSchema } from './schemas/dana.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: 'Token', schema: TokenSchema },
      { name: 'Dana', schema: DanaSchema },
    ]),
  ],
  controllers: [DanaController],
  providers: [DanaService],
  exports: [MongooseModule, DanaService]
})
export class DanaModule {}
