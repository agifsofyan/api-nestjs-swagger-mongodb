import { BadRequestException } from '@nestjs/common'
import * as Mailgun from 'mailgun-js'

const {
    MAIL_GUN_KEY,
    MAIL_GUN_DOMAIN
} = process.env

const mailgun = new Mailgun({apiKey: MAIL_GUN_KEY, domain: MAIL_GUN_DOMAIN})

export const sendMail = async (input) => {
    try {
        await mailgun.messages().send(input)
        return 'Email sent successfully'
    } catch (error) {
        throw new BadRequestException('Email failed to send')
    }
}