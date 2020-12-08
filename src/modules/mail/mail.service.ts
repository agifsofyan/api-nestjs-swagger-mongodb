import { 
	Injectable,
	BadRequestException,
} from '@nestjs/common';
import * as request from 'request';
import { checkSpace } from 'src/utils/CustomValidation';

const {
    MAIL_GUN_KEY,
    MAIL_GUN_DOMAIN
} = process.env

// const mailgun = new mg({apiKey: MAIL_GUN_KEY, domain: MAIL_GUN_DOMAIN})
var mailgun = require('mailgun-js')({apiKey: MAIL_GUN_KEY, domain: MAIL_GUN_DOMAIN});

@Injectable()
export class MailService {
    async sendMail(format: any) {
        const attachment = format.attachment.map(attach => request(attach))
        const data = {
            from: process.env.MAIL_FROM,
            to: format.to,
            cc: format.cc,
            bcc: format.bcc,
            subject: format.subject,
            text: format.text,
            attachment: attachment
        };

        try {
            const mailer = await mailgun.messages().send(data);
            return mailer
        } catch (error) {
            throw new BadRequestException(error.code)
        }
    }
    
    async createTemplate(template: any) {
        const name = checkSpace(template.name)
        if(name){
            throw new BadRequestException("Template.name is missing. Don't use whitespace")
        }

        const data = {
            "name" : template.name,
            "description": template.description
        }

        try {
            const mailer = await mailgun.post(`/${MAIL_GUN_DOMAIN}/templates`, data);
            return mailer.template
        } catch (error) {
            throw new BadRequestException(error.code)
        }
    }

    async getTemplates(limit: number) {
        try {
            const mailer = await mailgun.get(`/${MAIL_GUN_DOMAIN}/templates`, {"limit": limit ? limit : 10});
            console.log('mailer', mailer)
            return mailer
        } catch (error) {
            throw new BadRequestException(error.code)
        }
    }

    async getTemplate(template_name: string) {
        try {
            const mailer = await mailgun.get(`/${MAIL_GUN_DOMAIN}/templates/${template_name}`);
            return mailer.template
        } catch (error) {
            throw new BadRequestException(error.code)
        }
    }

    async updateTemplate(template_name: string, description: any) {
        // const data = { "description": description }
        try {
            const mailer = await mailgun.put(`/${MAIL_GUN_DOMAIN}/templates/${template_name}`, description);
            return mailer
        } catch (error) {
            // console.log('error', error)
            throw new BadRequestException(error.code)
        }
    }

    async dropTemplate(template_name: string) {
        // const data = { "description": description }
        try {
            const mailer = await mailgun.delete(`/${MAIL_GUN_DOMAIN}/templates/${template_name}`);
            return mailer
        } catch (error) {
            throw new BadRequestException(error.code)
        }
    }
}
