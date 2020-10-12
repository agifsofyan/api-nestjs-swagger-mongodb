import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SubdistrictService } from './subdistrict.service';
import { SubdistrictController } from './subdistrict.controller';
import { SubdistrictSchema } from './schemas/subdistrict.schema';

import { ProvinceModule } from '../provinces/province.module';
import { ProvinceService } from '../provinces/province.service';
import { ProvinceSchema } from '../provinces/schemas/province.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Subdistrict', schema: SubdistrictSchema },
      { name: 'Province', schema: ProvinceSchema }
    ]),
    ProvinceModule
  ],
  providers: [SubdistrictService, ProvinceService],
  controllers: [SubdistrictController]
})
export class SubdistrictModule {}
