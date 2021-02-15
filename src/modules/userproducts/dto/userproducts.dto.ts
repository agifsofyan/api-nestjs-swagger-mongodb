import {
    IsNotEmpty,
    IsString,
    IsArray,
    IsEnum,
    IsNumber
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class ProgressDTO {
    user: string;
    product: string;
    type: string;
    topic: string[];
    utm: string;
    expired_date: string;

    // Progress
    @ApiProperty({
        example: 20, // in percent
        description: 'read progress',
        format: 'number'
    })
    @IsNumber()
    @IsNotEmpty()
    progress: number;
}