import {
    IsNotEmpty,
    IsString,
    IsArray,
    IsEnum
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export enum EnumType {
	WA = 'WA',
	MAIL = 'MAIL'
}

export class CreateTemplateDTO {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'Follow Up Easy',
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

    @IsEnum(EnumType, { message: 'Type value is: WA or MAIL' })
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
