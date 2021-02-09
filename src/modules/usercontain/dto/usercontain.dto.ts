import {
    IsNotEmpty,
    IsString,
    IsEmail,
    IsPhoneNumber,
    MinLength,
    MaxLength
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LandingForm {
    // Topic ID
    @ApiProperty({
        example: '5fb636b3f5cdfe00749e0b05',
        description: 'Topic ID',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    topic: string;

    // Email
    @ApiProperty({
        example: 'anonymous@gmail.com',
        description: 'Email',
        format: 'email',
        uniqueItems: true
    })
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;
    
    // Name
    @ApiProperty({
        example: 'Riko',
        description: 'name',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    // Phone Number
    @ApiProperty({
        example: '085771461509',
        description: 'Phone Number',
        format: 'string',
        minLength: 6
    })
    @IsNotEmpty()
    @IsPhoneNumber('ID')
    @MinLength(10)
    @MaxLength(13)
    phone_number: string;
}
