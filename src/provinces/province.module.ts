import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ProvinceService } from './province.service';
import { ProvinceController } from './province.controller';
import { ProvinceSchema } from './schemas/province.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Province', schema: ProvinceSchema }
    ])
  ],
  providers: [ProvinceService],
  controllers: [ProvinceController],
  exports: [ProvinceService]
})
export class ProvinceModule {}
