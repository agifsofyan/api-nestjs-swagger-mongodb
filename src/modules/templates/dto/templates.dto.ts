import {
    IsNotEmpty,
    IsString,
    IsEnum
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TemplateType {
	WA = 'WA',
	MAIL = 'MAIL'
}

export class CreateTemplateDTO {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'template_name',
        description: 'Name',
        format: 'string',
        required: true
    })
    name: string;

    @ApiProperty({
        example: 'Template in here',
        description: 'Descrition',
        format: 'string',
        required: true
    })
    description: string;

    @IsEnum(TemplateType, { message: 'Type value is: WA or MAIL' })
    @ApiProperty({
        example: 'WA / MAIL',
        description: 'Type',
        enum: ['WA', 'MAIL'],
        format: 'enum string',
        required: true
    })
    type: string;

    by: string;
    
    // Html Template
    @ApiProperty({
        example: '<div class="entry"> <h1>{{title}}</h1> <div class="body"> {{body}} </div> </div>',
        description: 'Html Template',
        format: 'html tag',
        required: false
    })
    template: string;

    engine: string;
    tag: string;
    comment: string;
    active: boolean;
}

export class UpdateTemplateDTO {
    // Html Template
    @ApiProperty({
        example: '<div class="entry"> <h1>{{title}}</h1> <div class="body"> {{body}} </div> </div>',
        description: 'Html Template',
        format: 'html tag'
    })
    template: string;

    by: string;
    
    // Email Description
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'This template for email or whatsapp',
        description: 'Template desc',
        format: 'string'
    })
    description: string;
}

export class ArrayIdDTO {
    // Delete multiple ID or Clone Multiple Id
    @IsNotEmpty()
    @ApiProperty({
        example: ['wa_template', 'email_blast_template'],
        description: 'name',
        format: 'array string'
    })
    name: string[];
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