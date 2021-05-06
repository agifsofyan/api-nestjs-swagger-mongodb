import { IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CLassType {
    PRODUCT='product',
    CONTENT='content',
    VIDEO='video'
}

export class ActivityDTO {
    user_info: string;
    
    @IsNotEmpty()
    @IsArray()
    @ApiProperty({
        example: ['5fc721a51712590aa05641b5', '5fc721931712590aa05641b1'],
        description: 'Product Id',
        format: 'array'
    })
    product_id: string[];
}
