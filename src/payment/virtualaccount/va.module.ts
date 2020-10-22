import { Module, HttpModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VaService } from './va.service';
import { VaController } from './va.controller';
import { VASchema } from './schemas/va.schema';
import { UserModule } from '../../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
		  { name: 'VA', schema: VASchema },
    ]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    UserModule
  ],
  providers: [VaService],
  controllers: [VaController],
  exports: [MongooseModule, VaService]
})
export class VaModule {}
