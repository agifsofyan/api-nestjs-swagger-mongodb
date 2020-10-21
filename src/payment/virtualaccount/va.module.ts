import { Module, HttpModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VaService } from './va.service';
import { VaController } from './va.controller';
import { VASchema } from './schemas/va.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
		  { name: 'VA', schema: VASchema },
    ]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [VaService],
  controllers: [VaController]
})
export class VaModule {}
