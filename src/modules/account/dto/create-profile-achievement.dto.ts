import {
    IsNotEmpty,
    IsString,
    IsDate
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProfileAchievementDTO {
    // Title
    @ApiProperty({
        example: 'Winner the competition of Cloud Computing',
        description: 'Title',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    readonly title: string;

    // Issuer
    @ApiProperty({
        example: 'Joko - BCA Represents',
        description: 'Awarded by who',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    readonly issuer: string;

    // Description
    @ApiProperty({
        example: 'A cloud computing competition that held by BCA',
        description: 'Achievement description',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    readonly description: string;

    // Date
    @ApiProperty({
        example: '09/03/2020',
        description: 'Date',
        format: 'date'
    })
    // @IsDate()
    date: Date;
}