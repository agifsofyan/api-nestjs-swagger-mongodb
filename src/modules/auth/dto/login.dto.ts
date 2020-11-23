import {
    IsNotEmpty,
    IsEmail,
    IsString
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthLoginDTO {
    // Email
    @ApiProperty({
        example: 'superadmin@email.com',
        description: 'Email',
        format: 'email'
    })
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    readonly email: string;

    // Password
    @ApiProperty({
        example: 'password',
        description: 'Password',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    readonly password: string;
}