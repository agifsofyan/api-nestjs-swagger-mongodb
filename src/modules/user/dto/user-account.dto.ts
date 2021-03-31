import {
    IsNotEmpty,
    MinLength
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class newPasswordDTO {
    // Password
    @ApiProperty({
        example: 'changeme',
        description: 'Password',
        format: 'string',
        minLength: 6
    })
    @IsNotEmpty()
    @MinLength(6)
    password: string;
}