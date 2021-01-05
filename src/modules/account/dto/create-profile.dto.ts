import {
    IsNotEmpty,
    IsString,
    IsDate
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProfileDTO {
    // Bio
    @ApiProperty({
        example: 'I\'m an experienced digital marketing',
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
    // @IsDate() // cannot input as string in postman or swagger
    birth_date: Date;

    // Religion
    @ApiProperty({
        example: 'Buddha, Hindu, Islam, Katolik, Kristen',
        description: 'Religion',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    religion: string;
    
    // // Skills
    // @ApiProperty({
    //     example: 'Skills',
    //     description: 'User skills',
    //     format: 'array of string'
    // })
    // @IsArray()
    // skills?: [string];
}