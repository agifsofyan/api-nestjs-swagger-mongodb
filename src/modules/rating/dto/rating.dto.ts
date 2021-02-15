import {
    IsNotEmpty,
    IsString,
    IsArray,
    IsObject,
    IsNumber
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum RatingField {
    PRODUCT='product',
    TOPIC='topic',
    MENTOR='mentor'
}

export class PushRatingDTO {
    // Kind
    kind: string;

    // Type ID
    // @IsNotEmpty()
    // @IsString()
    // @ApiProperty({
    //     example: '5fb636b3f5cdfe00749e0b05',
    //     description: 'Kind ID',
    //     format: 'string'
    // })
    kind_id: string;

    // Rate
    @IsNotEmpty()
    // @IsArray()
    @IsObject()
    @ApiProperty({
        example: {
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