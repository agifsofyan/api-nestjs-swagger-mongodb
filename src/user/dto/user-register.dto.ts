import {
    IsNotEmpty,
    MinLength,
    MaxLength,
    IsEmail,
    IsString, IsPhoneNumber
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserRegisterDTO {
    // Name
    @ApiProperty({
        example: 'Agung M',
        description: 'User name',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    name: string;

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

    // Phone Number
    @ApiProperty({
        example: '085771461509',
        description: 'Phone Number',
        format: 'string',
        minLength: 6
    })
    @IsNotEmpty()
    @IsPhoneNumber('ID')
    @MinLength(11)
    @MaxLength(13)
    phone_number: string;

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