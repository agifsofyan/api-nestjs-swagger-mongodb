import { Module, HttpModule } from '@nestjs/common';
import { DanaController } from './dana.controller';

@Module({
  imports: [HttpModule],
  controllers: [DanaController]
})
export class DanaModule {}
