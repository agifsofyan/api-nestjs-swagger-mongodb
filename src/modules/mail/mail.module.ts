import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { UploadModule } from '../upload/upload.module';
import { TemplatesModule } from '../templates/templates.module';

@Module({
  imports: [
    UploadModule,
    TemplatesModule
  ],
  providers: [MailService],
  controllers: [MailController],
  exports: [MailService]
})
export class MailModule {}
