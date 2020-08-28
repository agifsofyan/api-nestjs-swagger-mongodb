import {
    IsNotEmpty,
    MinLength,
    MaxLength,
    IsEmail,
    IsString
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserRegisterDTO {
    // Email
    @ApiProperty({
        example: 'johndoe@gmail.com',
        description: 'Email',
        format: 'email',
        uniqueItems: true
    })
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    readonly email: string;

    // Password
    @ApiProperty({
        example: 'changeme',
        description: 'Password',
        format: 'string',
        minLength: 6,
        maxLength: 8
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    @MaxLength(8)
    readonly password: string;
}