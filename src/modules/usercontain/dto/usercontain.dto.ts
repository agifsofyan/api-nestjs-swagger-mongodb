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
    // @ApiProperty({
    //     example: '5fb636b3f5cdfe00749e0b05',
    //     description: 'Topic ID',
    //     format: 'string'
    // })
    // @IsNotEmpty()
    // @IsString()
    // topic: string;

    // Address Title
    title: string;

    // Province ID
    @ApiProperty({
        example: '5fb636b3f5cdfe00749e0b05',
        description: 'Province ID',
        format: 'string'
    })
    @IsString()
    province_id: string;

    // City ID
    @ApiProperty({
        example: '5fb636b3f5cdfe00749e0b05',
        description: 'City ID',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    city_id: string;

    // District
    district: string;

    // Sub District
    sub_district: string;

    // Detail Address
    @ApiProperty({
        example: 'Jl. Scientia Boulevard, Gading Serpong',
        description: 'Detail Address',
        format: 'string'
    })
    detail_address: string;

    // Postal Code
    postal_code: number;

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
