import {
    IsNotEmpty,
    IsString,
    IsArray
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMailDTO {
    // Email Receiver
    @IsNotEmpty()
    @IsArray()
    @ApiProperty({
        example: ['viankleo@gmail.com', 'zeroxstrong@gmail.com', 'nanime@ymail.com'],
        description: 'Email Receiver',
        format: 'array string'
    })
    to: [string];

    // Email CC
    @IsArray()
    @ApiProperty({
        example: ['viankleo@gmail.com', 'zeroxstrong@gmail.com', 'nanime@ymail.com'],
        description: 'Email CC',
        format: 'array string'
    })
    cc: [string];

    // Email BCC
    @IsArray()
    @ApiProperty({
        example: ['viankleo@gmail.com', 'zeroxstrong@gmail.com', 'nanime@ymail.com'],
        description: 'Email BCC',
        format: 'array string'
    })
    bcc: [string];

    // Email Subject
    @ApiProperty({
        example: 'Subject email Testing',
        description: 'Email Subject',
        format: 'string'
    })
    subject: string;

    // Email Text
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'Email content in here..| use \n to enter',
        description: 'Email Text',
        format: 'string'
    })
    text: string;

    // Attachment
    @ApiProperty({
        example: ["https://laruno2020.s3.ap-southeast-1.amazonaws.com/ASSETS/payment_method/alfamart.png", "https://laruno2020.s3.ap-southeast-1.amazonaws.com/ASSETS/products/family.png"],
        description: 'Attachment',
        format: 'string'
    })
    attachment: [string];
}

export class MailTemplateDTO {
    // Email Name
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'Confirm template',
        description: 'Template Name',
        format: 'string'
    })
    name: string;

    // Email Description
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'This template for email confirmation',
        description: 'Email desc',
        format: 'string'
    })
    description: string;
}

export class UpdateTemplateDTO {
    // Email Description
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'This template for email confirmation',
        description: 'Email desc',
        format: 'string'
    })
    description: string;
}
