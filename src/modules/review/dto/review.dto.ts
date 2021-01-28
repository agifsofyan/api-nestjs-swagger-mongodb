import {
    IsNotEmpty,
    IsString
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ReviewUID {
	ID = 'id',
	PRODUCT_ID = 'product_id',
	USER_ID = 'user_id'
}

export class PostReviewDTO {
    // User
    user: string;

    // Product
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: '5fbc8f1cb50b58001eeb76ef',
        description: 'Product ID',
        format: 'string'
    })
    product: string;

    // Opini
    @IsNotEmpty()
    @ApiProperty({
        example: 'productnya sangat bagus, terimakasih :)',
        description: 'Content Review',
        format: 'any'
    })
    opini: any;
}