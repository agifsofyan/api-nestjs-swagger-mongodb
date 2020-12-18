import { HttpModule, Module } from '@nestjs/common';

import { RajaongkirService } from './rajaongkir.service';
import { RajaongkirController } from './rajaongkir.controller';

@Module({
  imports: [HttpModule],
  providers: [RajaongkirService],
  controllers: [RajaongkirController],
  exports: [RajaongkirService]
})
export class RajaongkirModule {}
