import { IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class addCartDTO {
    user_info: string;
    
    @IsNotEmpty()
    @IsArray()
    @ApiProperty({
        example: ['5fc721a51712590aa05641b5', '5fc721931712590aa05641b1'],
        description: 'Product Id',
        format: 'array'
    })
    product_id: string[];

    @ApiProperty({
        example: 'facebook',
        description: 'utm from link / url (param)',
        format: 'string'
    })
    utm: string;
}
