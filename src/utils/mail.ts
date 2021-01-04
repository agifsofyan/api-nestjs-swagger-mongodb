import * as Mailgun from 'mailgun-js';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { MediaSchema } from 'src/modules/upload/schemas/media.schema';
import { IMedia } from 'src/modules/upload/interfaces/media.interface';

const {
    MAIL_GUN_KEY,
    MAIL_GUN_DOMAIN
} = process.env

var mediaModel = mongoose.model('Media', MediaSchema)
// var media = mediaModel Model<IMedia>

// const mailgun = new Mailgun({apiKey: MAIL_GUN_KEY, domain: MAIL_GUN_DOMAIN})

export const sendMail = () => {

    const getLogo = mediaModel.findOne({filename: "laruno_logo.png"})
    console.log('getLogo', getLogo)
    // input.html.replace("{{logo}}", "Adjie")
    // console.log('input', input)

    try {
        // await mailgun.messages().send(input)
        return 'Email sent successfully'
    } catch (error) {
        return 'Email failed to send'
    }
}