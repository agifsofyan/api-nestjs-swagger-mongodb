import {
    IsNotEmpty,
    IsEmail,
    IsString
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VideoLikesDTO {
    // User
    user: string;

    // IP
    ip: string;

    // Password
    @ApiProperty({
        example: 'password',
        description: 'Password',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    password: string;
}
