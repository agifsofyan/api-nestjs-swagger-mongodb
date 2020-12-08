import { BadRequestException } from "@nestjs/common";

const {
    MAIL_GUN_KEY,
    MAIL_GUN_DOMAIN
} = process.env

// const mailgun = new mg({apiKey: MAIL_GUN_KEY, domain: MAIL_GUN_DOMAIN})
var mg = require('mailgun-js')({apiKey: MAIL_GUN_KEY, domain: MAIL_GUN_DOMAIN});

// Send Email - Mailgun
export const mailgunSend = async (data) => {
    try {
        const mailgun = await mg.messages().send(data);
        return mailgun
    } catch (error) {
        throw new BadRequestException(error.code)
    }
}

// Create Email Template - Mailgun
export const mailgunTemplate = async (template) => {
    try {
        const mailgun = await mg.post(`/${MAIL_GUN_DOMAIN}/templates`, template);
        return mailgun.template
    } catch (error) {
        throw new BadRequestException(error.code)
    }
}

// Get Email Template - Mailgun
export const callTemplate = async (template_name) => {
    try {
        const mailgun = await mg.get(`/${MAIL_GUN_DOMAIN}/templates/${template_name}`);
        return mailgun.template
    } catch (error) {
        throw new BadRequestException(error.code)
    }
}
