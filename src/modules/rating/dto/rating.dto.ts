import {
    IsNotEmpty,
    IsString,
    IsArray,
    IsObject,
    IsNumber
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PushRatingDTO {
    // Type
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'category',
        description: 'Kind',
        format: 'string'
    })
    kind: string;

    // Type ID
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: '5fb636b3f5cdfe00749e0b05',
        description: 'Kind ID',
        format: 'string'
    })
    kind_id: string;

    // Rate
    @IsNotEmpty()
    // @IsArray()
    @IsObject()
    @ApiProperty({
        example: {
            user_id: '5f9f7296d4148a070021a423',
            value: 2
        },
        description: 'Rate',
        format: 'object'
    })
    rate: {
        user_id: string,
        value: number
    };
}