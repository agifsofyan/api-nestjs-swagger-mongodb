import { 
    BadRequestException,
	Injectable, NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUser } from 'src/modules/user/interfaces/user.interface';
import { ITemplate } from '../../templates/interfaces/templates.interface';
import { GetTimestamp } from 'src/utils/StringManipulation';

const {
    MAIL_GUN_KEY,
    MAIL_GUN_DOMAIN
} = process.env

var mailgun = require('mailgun-js')({apiKey: MAIL_GUN_KEY, domain: MAIL_GUN_DOMAIN});

@Injectable()
export class SendMailService {
    constructor(
        @InjectModel('Template') private readonly templateModel: Model<ITemplate>,
        @InjectModel('User') private readonly userModel: Model<IUser>
    ) {}

    async verifMail(input: any) {
        const getTemplate = await this.templateModel.findOne({ name: "laruno_verification" }).then(temp => {
            const version = temp.versions.find(res => res.active === true)
            return version
        })

        const mailLink = `http://139.162.59.84:5000/api/v1/mails/mailgun/verification?confirmation=${input.email}` //`laruno.${input.email}.${GetTimestamp()}`

        var template = (getTemplate.template).toString()
        template = template.replace("{{nama}}", input.name)
        template = template.replace("{{link}}", mailLink)

        var data = {
            from: "Verification" + process.env.MAIL_FROM,
            to: input.to,
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
        const getUser = await this.userModel.findOne({email: confirmation})

        if(!getUser){
            throw new NotFoundException('user or email not found')
        }

        const accountStatus = getUser.is_confirmed

        if(accountStatus === null){
            await this.userModel.findOneAndUpdate(
                {email: confirmation},
                {is_confirmed: new Date()}
            )
        }

        return 'https://www.laruno.id/'
    }
}
