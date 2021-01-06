import {
    IsNotEmpty,
    IsEmail,
    IsString,
    MinLength
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class newPasswordDTO {
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
    email: string;

    // OTP
    @ApiProperty({
        example: 321978,
        description: 'OTP',
        format: 'string',
        uniqueItems: true
    })
    @IsNotEmpty()
    @IsString()
    otp: string;

    // Password
    @ApiProperty({
        example: 'changeme',
        description: 'Password',
        format: 'string',
        minLength: 6
    })
    @IsNotEmpty()
    @MinLength(6)
    password: string;
}