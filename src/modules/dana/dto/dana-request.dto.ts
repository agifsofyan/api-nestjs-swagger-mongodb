import {
    IsNotEmpty,
    IsString,
    IsEmail,
    MinLength,
    MaxLength,
    IsPhoneNumber
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DanaRequestDTO {
    // Mobile Number
    @ApiProperty({
        example: 81212408246,
        description: 'Mobile +62 + number',
        format: 'string'
    })
    @IsNotEmpty()
    phone: string;

    // Email
    @ApiProperty({
        example: 'nime@gmail.com',
        description: 'Email',
        format: 'email',
        uniqueItems: true
    })
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;
}

export class DanaApplyTokenDTO {
    // Auth Code
    @ApiProperty({
        example: 'asdasasas',
        description: 'Auth Code',
        format: 'string',
    })
    @IsNotEmpty()
    @IsString()
    authCode: string;

    // User ID
    @ApiProperty({
        example: 'dffedsdsd',
        description: 'User Id',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    userId: string;
}