import {
    IsArray,
    IsNotEmpty,
    IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddBonusDTO {
    @ApiProperty({
        example: ['602dda671e352b12bc226dfd'],
        description: 'Product ID',
        format: 'string'
    })
    @IsNotEmpty()
    @IsArray()
    product_id: string[];

    @ApiProperty({
        example: '5f9f7296d4148a070021a423',
        description: 'User ID',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    user_id: string;
}