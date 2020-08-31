import {
    IsNotEmpty,
    IsString,
    IsDate
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProfileDTO {
    // Birth Place
    @ApiProperty({
        example: 'Jakarta, Indonesia',
        description: 'Birth Place',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    readonly birth_place: string;

    // Birth Date
    @ApiProperty({
        example: '07/30/92',
        description: 'Birth Date',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    readonly birth_date: string;

    // Religion
    @ApiProperty({
        example: 'Religion',
        description: 'Religion',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    readonly religion: string;
}