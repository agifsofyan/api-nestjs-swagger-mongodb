import { 
	Injectable,
	BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as request from 'request';
import { checkSpace } from 'src/utils/CustomValidation';
import { ITemplate } from '../templates/interfaces/templates.interface';

const {
    MAIL_GUN_KEY,
    MAIL_GUN_DOMAIN
} = process.env

// const mailgun = new mg({apiKey: MAIL_GUN_KEY, domain: MAIL_GUN_DOMAIN})
var mailgun = require('mailgun-js')({apiKey: MAIL_GUN_KEY, domain: MAIL_GUN_DOMAIN});

@Injectable()
export class MailService {
    constructor(
        @InjectModel('Template') private readonly templateModel: Model<ITemplate>
    ) {}

    async sendMail(format: any) {
        const attachment = format.attachment.map(attach => request(attach))
        const html = "<h1 style='background-color: black; color: gold;'>Ini adalah heading 1</h1>"
        const data = {
            from: process.env.MAIL_FROM,
            to: format.to,
            cc: format.cc,
            bcc: format.bcc,
            subject: format.subject,
            text: format.text,
            html: html,
            attachment: attachment
        };

        try {
            const mailer = await mailgun.messages().send(data);
            return mailer
        } catch (error) {
            throw new BadRequestException(error.code)
        }
    }
    
    async createTemplate(userId: string, template: any) {
        const name = checkSpace(template.name)
        if(name){
            throw new BadRequestException("Template.name is missing. Don't use whitespace")
        }

        const data = {
            name : template.name,
            description: template.description,
            by: userId,
            type: "MAIL"
        }

        try {
            const template = await new this.templateModel(data)
            template.save()
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

    async updateTemplate(userId: string, template_name: string, description: any) {
        const data = {
            description: description.description,
            by: userId
        }

        try {
            await this.templateModel.updateOne({name:name}, data)
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
