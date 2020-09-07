import {
    IsNotEmpty,
    IsString,
    IsDate,
    IsBoolean,
    IsArray
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProfileExperienceDTO {
    // Title
    @ApiProperty({
        example: 'Sales Manager',
        description: 'Title',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    readonly title: string;

    // Work type
    @ApiProperty({
        example: 'Full-time',
        description: 'Work type',
        format: 'array'
    })
    @IsNotEmpty()
    @IsArray()
    readonly type: [string];

    // Company
    @ApiProperty({
        example: 'Company',
        description: 'Where did he work',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    readonly company: string;

    // Location
    @ApiProperty({
        example: 'Location',
        description: 'Location of the company',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    location?: string;

    // Current
    @ApiProperty({
        example: 'Current',
        description: 'Is he currently working at the company?',
        format: 'boolean'
    })
    @IsNotEmpty()
    @IsBoolean()
    current?: boolean;

    // Start work
    @ApiProperty({
        example: '09/03/2020',
        description: 'When did he started to work?',
        format: 'date'
    })
    @IsDate()
    readonly startWotkAt: Date;

    // End work
    @ApiProperty({
        example: 'Current',
        description: 'When did he ended to work?',
        format: 'date'
    })
    @IsDate()
    endWorkAt?: Date;
}