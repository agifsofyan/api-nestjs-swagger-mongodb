import {
    IsNotEmpty,
    IsString,
    IsArray
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateFollowUpDTO {
    // Message
    @ApiProperty({
        example: 'Message from wa template to follow up',
        description: 'Message',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    message: string;
}

export enum templateFollow {
    FOLLOWUP1='followup1',
    FOLLOWUP2='followup2',
    FOLLOWUP3='followup3',
    FOLLOWUP4='followup4',
    FOLLOWUP5='followup5',
}

export class SetTemplateFollowUpDTO {
    @ApiProperty({
        example: 'Halo kami dari Laruno 😀',
        description: 'template',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    template: string;
}
