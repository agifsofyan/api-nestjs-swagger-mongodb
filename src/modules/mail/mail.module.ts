import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplateSchema } from '../templates/schemas/templates.schema';
import { MediaSchema } from '../upload/schemas/media.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Media', schema: MediaSchema },
      { name: 'Template', schema: TemplateSchema },
    ])
  ],
  providers: [MailService],
  controllers: [MailController],
  exports: [MongooseModule, MailService]
})
export class MailModule {}
