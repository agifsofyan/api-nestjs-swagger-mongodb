import {
    IsNotEmpty,
    IsString,
    IsArray
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export enum Sort {
	asc = 'asc',
	desc = 'desc'
}

export class GamificationDTO {
    // Name
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'Career',
        description: 'Name',
        format: 'string'
    })
    name: string;

    // Icon
    @ApiProperty({
        example: 'http://dummy.com/image/icons.ico',
        description: 'Icon',
        format: 'string'
    })
    icon: string;
}