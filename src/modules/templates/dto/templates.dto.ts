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
        format: 'string'
    })
    name: string;

    @ApiProperty({
        example: 'Template in here',
        description: 'Descrition',
        format: 'string'
    })
    description: string;

    @IsEnum(EnumType, { message: 'Type value is: WA or MAIL' })
    @ApiProperty({
        example: 'WA / MAIL',
        description: 'Type',
        enum: ['WA', 'MAIL'],
        format: 'enum string'
    })
    type: string;

    by: string;
}

export class UpdateTemplateDTO {
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
