import {
    IsNotEmpty,
    IsString,
    IsArray,
    IsObject
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMailDTO {
    // Email Receiver
    @IsNotEmpty()
    @IsArray()
    @ApiProperty({
        example: ['viankleo@gmail.com', 'zeroxstrong@gmail.com', 'nanime@ymail.com'],
        description: 'Email Receiver',
        format: 'array string',
        required: true
    })
    to: [string];

    // Email CC
    @IsArray()
    @ApiProperty({
        example: ['viankleo@gmail.com', 'zeroxstrong@gmail.com', 'nanime@ymail.com'],
        description: 'Email CC',
        format: 'array string',
        required: false
    })
    cc: [string];

    // Email BCC
    @IsArray()
    @ApiProperty({
        example: ['viankleo@gmail.com', 'zeroxstrong@gmail.com', 'nanime@ymail.com'],
        description: 'Email BCC',
        format: 'array string',
        required: false
    })
    bcc: [string];

    // Email Subject
    @ApiProperty({
        example: 'Subject email Testing',
        description: 'Email Subject',
        format: 'string',
        required: false
    })
    subject: string;

    // Email Text
    @IsString()
    @ApiProperty({
        example: 'Email content in here..| use \n to enter',
        description: 'Email Text',
        format: 'string',
        required: false
    })
    text: string;

    // Attachment
    @ApiProperty({
        example: ["https://laruno2020.s3.ap-southeast-1.amazonaws.com/ASSETS/payment_method/alfamart.png", "https://laruno2020.s3.ap-southeast-1.amazonaws.com/ASSETS/products/family.png"],
        description: 'Attachment',
        format: 'string',
        required: false
    })
    attachment: [string];

    // HTML
    @ApiProperty({
        example: "<h1> Hello Mr. Sapta </h1>",
        description: 'HTML tag (script)',
        format: 'html tag (script)',
        required: false
    })
    html: string;

    // Template
    @ApiProperty({
        example: 'laruno_verification',
        description: 'Email template. Use this if need a template to send mail',
        format: 'string',
        required: false
    })
    template: string;

    // Template
    @ApiProperty({
        example: {
            "title": "API Documentation",
            "body": "Sending messages with templates"
        },
        description: 'Variabel to parse to Email template. Use this if need a template to send mail',
        format: 'object',
        required: false
    })
    "h:X-Mailgun-Variables": object;
}

export class MailTemplateDTO {
    // Html Template
    @ApiProperty({
        example: '<div class="entry"> <h1>{{title}}</h1> <div class="body"> {{body}} </div> </div>',
        description: 'Html Template',
        format: 'html tag',
        required: false
    })
    template: string;

    // Email Name
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'Confirm template',
        description: 'Template Name',
        format: 'string',
        required: true
    })
    name: string;

    by: string;

    // Email Description
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'This template for email confirmation',
        description: 'Email desc',
        format: 'string',
        required: true
    })
    description: string;
}

export class UpdateTemplateDTO {
    // Html Template
    @ApiProperty({
        example: '<div class="entry"> <h1>{{title}}</h1> <div class="body"> {{body}} </div> </div>',
        description: 'Html Template',
        format: 'html tag',
        required: false
    })
    template: string;

    by: string;
    
    // Email Description
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'This template for email confirmation',
        description: 'Email desc',
        format: 'string',
        required: true
    })
    description: string;
}

export class newVersionDTO {
    // Template Tag
    @ApiProperty({
        example: 'v0',
        description: 'Template tag (version)',
        format: 'string',
        required: true
    })
    tag: string;

    // Html Template
    @ApiProperty({
        example: '<div class="entry"> <h1>{{title}}</h1> <div class="body"> {{body}} </div> </div>',
        description: 'Html Template',
        format: 'html script',
        required: false
    })
    template: string;

    // Html Template
    @ApiProperty({
        example: 'Comment in here',
        description: 'Comment to templatre version',
        format: 'string',
        required: false
    })
    comment: string;

    // Html Template
    @ApiProperty({
        example: true,
        description: 'set true if want activate this version..',
        format: 'boolean',
        required: false
    })
    active: boolean;

    engine: string;
}

export class updateVersionDTO {
    // Html Template
    @ApiProperty({
        example: '<div class="entry"> <h1>{{title}}</h1> <div class="body"> {{body}} </div> </div>',
        description: 'Html Template',
        format: 'html script',
        required: false
    })
    template: string;

    // Html Template
    @ApiProperty({
        example: 'Comment in here',
        description: 'Comment to templatre version',
        format: 'string',
        required: false
    })
    comment: string;

    // Html Template
    @ApiProperty({
        example: true,
        description: 'set true if want activate this version..',
        format: 'boolean',
        required: false
    })
    active: boolean;

    engine: string;
}