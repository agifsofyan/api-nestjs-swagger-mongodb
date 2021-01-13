import {
    IsNotEmpty,
    IsString,
    IsEmail,
    MinLength,
    MaxLength,
    IsPhoneNumber
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// name: String,
//     token: String,
//     created_date: { type: Date, default: new Date() },
//     expired_date: { type: Date },

export class TokenDTO {
    // Name
    @ApiProperty({
        example: 'Dana',
        description: 'Token Name',
        format: 'string',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    // token
    @ApiProperty({
        example: 'xdsadaqsqdccdasa',
        description: 'token',
        format: 'string',
        uniqueItems: true
    })
    @IsNotEmpty()
    @IsString()
    token: string;

    // created_date
    created_date: string;

    // expired_date
    expired_date: { type: Date }

    // User ID
    userId: string
}