import {
    IsNotEmpty,
    IsString,
    IsDate
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProfileDTO {
    // Bio
    @ApiProperty({
        example: 'I\'m an experienced as a marketing strategy',
        description: 'Bio',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    bio: string;

    // Birth Place
    @ApiProperty({
        example: 'Jakarta, Indonesia',
        description: 'Birth place',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    birth_place: string;

    // Birth Date
    @ApiProperty({
        example: '1992/07/30',
        description: 'Birth date',
        format: 'string'
    })
    @IsNotEmpty()
    @IsDate()
    birth_date: Date;

    // Religion
    @ApiProperty({
        example: 'Religion',
        description: 'User religion',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    religion: string;

    // Location
    @ApiProperty({
        example: 'Location',
        description: 'Location of the user',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    location: string;

    // // Skills
    // @ApiProperty({
    //     example: 'Skills',
    //     description: 'User skills',
    //     format: 'array of string'
    // })
    // @IsArray()
    // skills?: [string];
}