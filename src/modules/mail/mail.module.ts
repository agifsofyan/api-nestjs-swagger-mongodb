import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplateSchema } from '../templates/schemas/templates.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Template', schema: TemplateSchema }
    ]),
  ],
  providers: [MailService],
  controllers: [MailController]
})
export class MailModule {}
