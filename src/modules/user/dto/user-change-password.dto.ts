import {
    IsNotEmpty,
    MinLength
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserChangePasswordDTO {
    // Old Password
    @ApiProperty({
        example: 'changeme',
        description: 'Old password',
        format: 'string'
    })
    @IsNotEmpty()
    old_password: string;

    // New Password
    @ApiProperty({
        example: 'changeme',
        description: 'New password must be at least 6 characters.',
        format: 'string'
    })
    @IsNotEmpty()
    @MinLength(6)
    password: string;
}