import {
    IsNotEmpty,
    IsString,
    IsArray,
    IsEnum
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
    // Favorite topics
    @ApiProperty({
        example: ['5f87cd2b8f81060165f1de63', '5fb636b3f5cdfe00749e0b05'],
        description: 'Favorite Topics',
        format: 'array string'
    })
    @IsNotEmpty()
    @IsArray()
    favorite_topics: string[];

    // Profession
    @ApiProperty({
        example: 'employee',
        description: 'Profession',
        format: 'enum string',
        enum: ProfessionValue
    })
    @IsNotEmpty()
    @IsString()
    @IsEnum(ProfessionValue, { message: 'Type value is: employee, professional, business, investor, other' })
    profession: ProfessionValue;
    
    // KTP
    @ApiProperty({
        example: '3309330923456781',
        description: 'KTP Number',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    ktp_numb: string;
    
    class?: object[];
    mobile_numbers?: object[];
    sales_commission?: object;
}