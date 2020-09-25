import {
    IsNotEmpty,
    IsString,
    IsDate,
    IsBoolean
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
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    readonly type: string;

    // Company
    @ApiProperty({
        example: 'Company',
        description: 'Where did he work',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    readonly company: string;

    // Address
    @ApiProperty({
        example: 'Jakarta, Indonesia',
        description: 'Company address',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    address?: string;

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
        description: 'When did he start to work?',
        format: 'date'
    })
    @IsDate()
    readonly startWorkAt: Date;

    // End work
    @ApiProperty({
        example: 'Current',
        description: 'When was the last time he ended his career?',
        format: 'date'
    })
    @IsDate()
    endWorkAt?: Date;
}