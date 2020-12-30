import {
    IsNotEmpty,
    IsString,
    IsArray,
    IsObject
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class verifMailDTO {
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

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'Anton',
        description: 'User Name',
        format: 'string',
        required: true
    })
    name: string;

    // @ApiProperty({
    //     example: '139.162.59.84:5000/api/v1/verif',
    //     description: 'Verification Link',
    //     format: 'string',
    //     required: true
    // })
    link: string;
}