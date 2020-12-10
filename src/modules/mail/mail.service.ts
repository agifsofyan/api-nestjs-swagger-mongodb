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
            // text: format.text,
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
    
    async createTemplate(userId: string, input: any) {
        const name = checkSpace(input.name)
        if(name){
            throw new BadRequestException("Template.name is missing. Don't use whitespace")
        }

        const data = {
            name : input.name,
            description: input.description,
            template: input.template,
            by: userId,
            type: "MAIL",
            versions: [{
                engine: 'handlebars',
                tag: (!input.tag) ? 'initial' : input.tag,
                comment: (!input.comment) ? null : input.comment,
                active: (!input.active) ? true : input.active,
                createdAt: new Date()
            }]
        }

        console.log('data', data)

        try {
            const template = await new this.templateModel(data)
            template.save()
            const mailer = await mailgun.post(`/${MAIL_GUN_DOMAIN}/templates`, input);
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

    async updateTemplate(userId: string, template_name: string, input: any) {
        const data = {
            description: input.description,
            by: userId
        }

        try {
            await this.templateModel.findOneAndUpdate({name:template_name}, data);
            const mailer = await mailgun.put(`/${MAIL_GUN_DOMAIN}/templates/${template_name}`, input);
            return mailer
        } catch (error) {
            // console.log('error', error)
            throw new BadRequestException(error.code)
        }
    }

    async dropTemplate(template_name: string) {
        try {
            const mailer = await mailgun.delete(`/${MAIL_GUN_DOMAIN}/templates/${template_name}`);
            return mailer
        } catch (error) {
            throw new BadRequestException(error.code)
        }
    }

    async getTemplatesVersion(template_name: string) {
        try {
            const mailer = await mailgun.get(`/${MAIL_GUN_DOMAIN}/templates/${template_name}/versions`);
            return mailer
        } catch (error) {
            throw new BadRequestException(error.code)
        }
    }

    async newTemplatesVersion(template_name: string, input: any) {
        const tag = checkSpace(input.tag)
        if(tag){
            throw new BadRequestException("tag is missing. Don't use whitespace")
        }

        input.engine = "handlebars"
        
        try {
            const mailer = await mailgun.post(`/${MAIL_GUN_DOMAIN}/templates/${template_name}/versions`, input);
            return mailer
        } catch (error) {
            throw new BadRequestException(error.code)
        }
    }

    async updateTemplatesVersion(template_name: string, version_tag: string, input: any) {
        try {
            const mailer = await mailgun.put(`/${MAIL_GUN_DOMAIN}/templates/${template_name}/versions/${version_tag}`, input);
            return mailer
        } catch (error) {
            throw new BadRequestException(error.code)
        }
    }

    async dropTemplatesVersion(template_name: string, version_tag: string) {
        try {
            const mailer = await mailgun.delete(`/${MAIL_GUN_DOMAIN}/templates/${template_name}/versions/${version_tag}`);
            return mailer
        } catch (error) {
            throw new BadRequestException(error.code)
        }
    }
}
