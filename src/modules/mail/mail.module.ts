import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplateSchema } from '../templates/schemas/templates.schema';
import { SendMailService } from './services/sendmail.service';
import { UserSchema } from '../user/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Template', schema: TemplateSchema },
      { name: 'User', schema: UserSchema },
    ])
  ],
  providers: [MailService, SendMailService],
  controllers: [MailController]
})
export class MailModule {}
