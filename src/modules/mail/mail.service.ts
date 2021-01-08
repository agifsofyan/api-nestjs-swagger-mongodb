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
    URL_MAIL,
    CLIENT,
    CLIENT_API_PORT
} = process.env

const mailgun = new Mailgun({apiKey: MAIL_GUN_KEY, domain: MAIL_GUN_DOMAIN})

@Injectable()
export class MailService {
    constructor(
        @InjectModel('Template') private readonly templateModel: Model<ITemplate>,
        @InjectModel('Media') private readonly mediaModel: Model<IMedia>,
    ) {}

    async createVerify(data: any) {

        let unique = data.to + "." +  StrToUnix(new Date())

        let logo = null

        const getLogo = await this.mediaModel.findOne({filename: "laruno_logo.png"})

        if(getLogo) {
            logo = getLogo.url
        }

        // const mailLink = `${URL_MAIL}:${CLIENT_API_PORT}/api/v1/mails/mailgun/verification?confirmation=${unique}`
        var mailLink = `${CLIENT}/verification?confirmation=${unique}`
        var templateName = 'mail_verification'

        if(data.type === 'forget'){
            templateName = 'forget_password'
            // mailLink = `${mailLink}&remember=${true}`
        }

        if(data.type === 'order'){
            templateName = 'order_notif'
            mailLink = `${CLIENT}/checkout`
        }

        const getTemplate = await this.templateModel.findOne({ name: templateName }).then(temp => {
            const version = temp.versions.find(res => res.active === true)
            return version
        })

        var template = (getTemplate.template).toString()
        
        var html = template.replace("{{nama}}", data.name).replace("{{logo}}", logo)

        if(data.type === 'forget'){
            const otp = randomIn(6).toString()
            data.html = html.replace("{{otp}}", otp)
            const sendOTP = await this.sendMail(data)
            return {
                mail: sendOTP,
                otp: otp
            }
        }

        if(data.type === 'order'){
            data.html = html.replace("{{order}}", data.orderTb).replace("{{total_price}}", data.totalPrice)
            const result = await this.sendMail(data)
            return result
        }
        
        data.html = html.replace("{{link}}", mailLink)
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
