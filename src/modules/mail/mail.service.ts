import { 
	Injectable
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ITemplate } from '../templates/interfaces/templates.interface';
import * as Mailgun from 'mailgun-js';
import { IMedia } from '../upload/interfaces/media.interface';
import { StrToUnix } from 'src/utils/StringManipulation';
import { randomIn } from 'src/utils/helper';

const {
    MAIL_GUN_KEY,
    MAIL_GUN_DOMAIN,
    CLIENT,
    API
} = process.env

const mailgun = new Mailgun({apiKey: MAIL_GUN_KEY, domain: MAIL_GUN_DOMAIN})

@Injectable()
export class MailService {
    constructor(
        @InjectModel('Template') private readonly templateModel: Model<ITemplate>,
        @InjectModel('Media') private readonly mediaModel: Model<IMedia>,
    ) {}

async templateGenerate(data: any) {

        let unique = data.to + "." +  StrToUnix(new Date())

        let logo = null

        const getLogo = await this.mediaModel.findOne({filename: "laruno_logo.png"})

        if(getLogo) {
            logo = getLogo.url
        }

        var mailLink = `${API}/users/verification?confirmation=${unique}`
        // var mailLink = `${CLIENT}/verification?confirmation=${unique}`
        var templateName = 'mail_verification'

        if(data.type === 'verification'){
            templateName = templateName
            mailLink = mailLink
        }

        if(data.type === 'forget'){
            templateName = 'forget_password'
            // mailLink = `${mailLink}&remember=${true}`
        }

        if(data.type === 'order'){
            templateName = 'order_notif'
            mailLink = `${CLIENT}/check-out`
        }

        // if(data.type === 'login'){
        //     templateName = 'login_notif'
        //     mailLink = `${CLIENT}`
        // }

        const getTemplate = await this.templateModel.findOne({ name: templateName }).then(temp => {
            const version = temp.versions.find(res => res.active === true)
            return version
        })

        var template = (getTemplate.template).toString()
        
        var html = template.replace("{{nama}}", data.name).replace("{{logo}}", logo)

        if(data.type === 'order'){
            data.html = html.replace("{{link}}", mailLink).replace("{{order}}", data.orderTb).replace("{{total_price}}", data.totalPrice)
        }

        if(data.type === 'verification'){
            data.html = html.replace("{{link}}", mailLink)
        }

        // if(data.type === 'login'){
        //     data.html = html.replace("{{info.v}}", data.info.version)
        // }

        if(data.type === 'forget'){
            const otp = randomIn(6).toString()
            data.html = html.replace("{{otp}}", otp)
            const sendOTP = await this.sendMail(data)
            return {
                mail: sendOTP,
                otp: otp
            }
        }
        
        return await this.sendMail(data)
    }

    async sendMail(input: any) {
        // const attachment = input.attachment.map(attach => request(attach))
        try {
            await mailgun.messages().send(input)
            return 'Email sent successfully'
        } catch (error) {
            return 'Email failed to send, please manual send'
        }
    }
}
