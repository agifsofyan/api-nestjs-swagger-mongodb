import { Module } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplateSchema } from './schemas/templates.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Template', schema: TemplateSchema }
    ]),
  ],
  providers: [TemplatesService],
  controllers: [TemplatesController],
  exports: [MongooseModule, TemplatesService]
})
export class TemplatesModule {}
