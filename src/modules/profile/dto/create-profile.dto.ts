import {
    IsNotEmpty,
    IsString,
    IsArray,
    IsEnum,
    IsObject,
    IsEmail
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ProfessionValue {
    EMPLOYEE='employee',
    PROFESSIONAL='professional',
    BUSINESS='business',
    INVESTOR='investor',
    OTHER='other',
}

export class CreateProfileDTO {
    // Name
    @ApiProperty({
        example: 'Anto',
        description: 'Name',
        format: 'string'
    })
    name: string;

    // Email
    @ApiProperty({
        example: 'anto.merahjambu@ymail.com',
        description: 'Email',
        format: 'email',
        uniqueItems: true
    })
    email: string;

    // Photo Profile
    @ApiProperty({
        example: 'https://s3.ap-southeast-1.amazonaws.com/cdn.laruno.com/connect/users/profiles/user-icon.png',
        description: 'Photo Profile',
        format: 'string'
    })
    avatar: string;

    // Email Confirmation
    is_confirmed: boolean;

    // Profession
    @ApiProperty({
        example: {
            value: 'other',
            info: 'College student'
        },
        description: 'Profession',
        format: 'Object String'
    })
    profession: {
        value: ProfessionValue,
        info: string,
    };
    
    // KTP
    @ApiProperty({
        example: '3309330923456781',
        description: 'KTP Number',
        format: 'string'
    })
    ktp_numb: string;

    // KTP Verified
    ktp_verified: boolean;

    // Phone Numbers
    @ApiProperty({
        example: [{
            country_code: '+62',
            phone_number: '8989900272',
            isWhatsapp: true,
            isDefault: true,
            note: 'simpati',
        }],
        description: 'Phone Number',
        format: 'array of object'
    })
    phone_numbers: [{
        country_code: string;
        phone_number: string;
        isWhatsapp: boolean;
        isDefault: boolean;
        note: string;
    }];

    // Password
    @ApiProperty({
        example: '57Aka5Wp',
        description: 'Password',
        format: 'string'
    })
    password: string;
}