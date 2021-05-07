import {
    IsNotEmpty,
    isString,
    IsString
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ReviewUID {
	ID = 'id',
	PRODUCT_ID = 'product_id',
	USER_ID = 'user_id',
	CONTENT_ID = 'content_id',
}

export class PostReviewDTO {
    // User
    user: string;

    // Product
    @ApiProperty({
        example: '5fbc8f1cb50b58001eeb76ef',
        description: 'Product ID',
        format: 'string'
    })
    product: string;

    // Content
    @ApiProperty({
        example: '5fbc8f1cb50b58001eeb76ef',
        description: 'Product ID',
        format: 'string'
    })
    content: string;

    // Opini
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'productnya sangat bagus, terimakasih :)',
        description: 'Content Review',
        format: 'any'
    })
    opini: any;
}