import {
    IsNotEmpty,
    IsEmail,
    IsString
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserLoginDTO {
    // Email
    @ApiProperty({
        example: 'zeroxstrong@gmail.com',
        description: 'Email',
        format: 'email'
    })
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    // Password
    @ApiProperty({
        example: 'password',
        description: 'Password',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    password: string;
}
