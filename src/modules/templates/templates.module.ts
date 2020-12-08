import { Module } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplateSchema } from './schemas/templates.schema';
import { MailService } from '../mail/mail.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Template', schema: TemplateSchema }
    ]),
  ],
  providers: [TemplatesService, MailService],
  controllers: [TemplatesController]
})
export class TemplatesModule {}
