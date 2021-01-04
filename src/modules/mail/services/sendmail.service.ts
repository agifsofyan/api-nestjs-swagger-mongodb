import { 
    BadRequestException,
	Injectable, NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUser } from 'src/modules/user/interfaces/user.interface';
import { ITemplate } from '../../templates/interfaces/templates.interface';
import { GetTimestamp, StrToUnix } from 'src/utils/StringManipulation';
import { IMedia } from 'src/modules/upload/interfaces/media.interface';

const {
    MAIL_GUN_KEY,
    MAIL_GUN_DOMAIN
} = process.env

var mailgun = require('mailgun-js')({apiKey: MAIL_GUN_KEY, domain: MAIL_GUN_DOMAIN});

@Injectable()
export class SendMailService {
    constructor(
        @InjectModel('Template') private readonly templateModel: Model<ITemplate>,
        @InjectModel('User') private readonly userModel: Model<IUser>,
        @InjectModel('Media') private readonly mediaModel: Model<IMedia>,
    ) {}

    async createVerify(input: any) {
        const getTemplate = await this.templateModel.findOne({ name: "laruno_verification" }).then(temp => {
            const version = temp.versions.find(res => res.active === true)
            return version
        })

        const now = new Date();

        const unique = input.email + '.' +  StrToUnix(now)

        const mailLink = `http://139.162.59.84:5000/api/v1/mails/mailgun/verification?confirmation=${unique}`

        const media = await this.mediaModel.findOne({filename: 'laruno_logo.png'})

        var template = (getTemplate.template).toString()
        template = template.replace("{{logo}}", !media ? '' : media.url)
        template = template.replace("{{nama}}", input.name)
        template = template.replace("{{link}}", mailLink)

        var data = {
            from: "Verification" + process.env.MAIL_FROM,
            to: input.email,
            subject: 'Please confirm your LARUNO account',
            html: template
        }

        try {
            const query = await mailgun.messages().send(data)
            return query
        } catch (error) {
            throw new BadRequestException()
        }
    }

    async verify(confirmation: string) {
        const mailArray = confirmation.split('.')

        const unique = mailArray[(mailArray.length - 1)]

        const trueMail = confirmation.replace(`.${unique}`, '')

        const getUser = await this.userModel.findOne({email: trueMail})

        if(!getUser){
            throw new NotFoundException('user or email not found')
        }

        if(getUser.is_confirmed === null){
            await this.userModel.findOneAndUpdate(
                {email: trueMail},
                {is_confirmed: new Date()}
            )
        }

        return 'ok'
    }
}
