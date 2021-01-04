import { 
	Injectable,
	BadRequestException,
    NotFoundException,
    InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as request from 'request';
import { checkSpace } from 'src/utils/CustomValidation';
import { ITemplate } from '../templates/interfaces/templates.interface';
import * as Mailgun from 'mailgun-js';

const {
    MAIL_GUN_KEY,
    MAIL_GUN_DOMAIN
} = process.env

const mailgun = new Mailgun({apiKey: MAIL_GUN_KEY, domain: MAIL_GUN_DOMAIN})

@Injectable()
export class MailService {
    constructor(
        @InjectModel('Template') private readonly templateModel: Model<ITemplate>
    ) {}

    async sendMail(format: any) {
        const attachment = format.attachment.map(attach => request(attach))
        // const data = {
        //     ...format,
        //     from: process.env.MAIL_FROM,
        //     attachment: attachment
        // }

        // var data = {
        //     from: "Confirm Figa Oz " + process.env.MAIL_FROM,
        //     to: 'zeroxstrong@gmail.com',
        //     subject: 'Test Confirm HTML',
        //     template: 'laruno_verification',
        //     "h:X-Mailgun-Variables": {
        //         "nama": "Endah Kumalasari",
        //         "link": "https://confirmation.ts"
        //     },
        //     html: htmlTemp
        // }

        const getTemplate = await this.templateModel.findOne({ name: "laruno_verification" }).then(temp => {
            const version = temp.versions.find(res => res.active === true)
            return version
        })

        var template = (getTemplate.template).toString()
        var htmlTemp = template.replace("{{nama}}", "Adjie").replace("{{logo}}", "Adjie").replace("{{link}}", "Adjie")

        var data = {
            from: "Confirm Figa Oz " + process.env.MAIL_FROM,
            to: 'zeroxstrong@gmail.com',
            subject: 'Test Confirm HTML',
            html: htmlTemp
        }

        console.log('data', data)

        // try {
            const query = await mailgun.messages().send(data)
            console.log('query', query)
            return query
        // } catch (error) {
        //     throw new BadRequestException()
        // }
    }
    
    async createTemplate(input: any) {
        const name = checkSpace(input.name)
        if(name){
            throw new BadRequestException("Template.name is missing. Don't use whitespace")
        }

        const data = {
            name : input.name,
            description: input.description,
            by: input.by,
            type: "MAIL",
            versions: [{
                template: input.template,
                engine: 'handlebars',
                tag: (!input.tag) ? 'initial' : input.tag,
                comment: (!input.comment) ? null : input.comment,
                active: (!input.active) ? true : input.active,
                createdAt: new Date()
            }]
        }

        const template = await new this.templateModel(data)
        template.save()

        try {
            const mailer = await mailgun.post(`/${MAIL_GUN_DOMAIN}/templates`, input);
            return mailer.template
        } catch (error) {
            throw new BadRequestException(error.code)
        }
    }

    async getTemplates(limit: number) {
        try {
            return await mailgun.get(`/${MAIL_GUN_DOMAIN}/templates`, {"limit": limit ? limit : 10})
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

    async updateTemplate(template_name: string, input: any) {
        const data = {
            description: input.description,
            by: input.by
        }

        await this.templateModel.findOneAndUpdate({name:template_name}, data)

        try {
            return await mailgun.put(`/${MAIL_GUN_DOMAIN}/templates/${template_name}`, input)
        } catch (error) {
            // console.log('error', error)
            throw new BadRequestException(error.code)
        }
    }

    async dropTemplate(template_name: string) {
        await this.templateModel.findOneAndDelete({name:template_name});
        try {
            return await mailgun.delete(`/${MAIL_GUN_DOMAIN}/templates/${template_name}`)
        } catch (error) {
            throw new BadRequestException(error.code)
        }
    }

    async getTemplatesVersion(template_name: string) {
        try {
            return await mailgun.get(`/${MAIL_GUN_DOMAIN}/templates/${template_name}/versions`)
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

        var active = true
		if(!input.active || input.active == false || input.active === 'false'){
			active = false
		}
        
        var mailer = await this.templateModel.findOne({name: template_name})
        
        if(active === true){
            mailer.set(mailer.versions.map(mail => {
                mail.active = !active
                return mail
            }))
        }
        
        mailer.versions.push(input)
        mailer.save()
        
        try {
            return await mailgun.post(`/${MAIL_GUN_DOMAIN}/templates/${template_name}/versions`, input)
        } catch (error) {
            throw new BadRequestException(error.code)
        }
    }

    async updateTemplatesVersion(template_name: string, version_tag: string, input: any) {
        var mailer = await this.templateModel.findOne({name: template_name})
		
		var activeVersion = mailer.versions.find(mail => mail.tag === version_tag)

		if(!mailer || !activeVersion) {
			throw new NotFoundException('template version not found')
		}
		
		input = {
            template: !input.template ? activeVersion.template : input.template,
            tag: !input.tag ? activeVersion.tag : input.tag,
            comment: !input.comment ? activeVersion.comment : input.comment,
            active: !input.active ? activeVersion.active : Boolean(input.active)
        }

        if(input.active && input.active !== activeVersion.active){
            await this.templateModel.findOneAndUpdate(
                {name: template_name},
                {$set: {
                    'versions.$[].active': !input.active
                }}
            )
        }

        await this.templateModel.findOneAndUpdate(
            {name: template_name, "versions.tag": version_tag},
            {$set: { 'versions.$': input }},
            {upsert: true}
        )
        
        try {
            return await mailgun.put(`/${MAIL_GUN_DOMAIN}/templates/${template_name}/versions/${version_tag}`, input)
        } catch (error) {
            if(error.statusCode === 400){
                throw new BadRequestException
            }else if (error.statusCode === 404){
                throw new NotFoundException('template version not found')
            }else{
                throw new InternalServerErrorException
            }
        }
    }

    async dropTemplatesVersion(template_name: string, version_tag: string) {
        await this.templateModel.findOneAndUpdate(
            {name: template_name, "versions.tag": version_tag},
            {$pull: { versions: { tag: version_tag } }},
            {upsert: true, new: true}
        )
            
        try {
            return await mailgun.delete(`/${MAIL_GUN_DOMAIN}/templates/${template_name}/versions/${version_tag}`)
        } catch (error) {
            throw new BadRequestException(error.code)
        }
    }
}
