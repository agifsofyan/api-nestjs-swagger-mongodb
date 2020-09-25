import { IsEmail, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

import { ICart } from "../../cart/interfaces/cart.interface";
import { Address } from "../interfaces/order-address.interface";

export class OrderDTO {
    // Order ID
    @ApiProperty({
        example: '#ORDER-1271318BAS',
        description: 'Generate order id by random string',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    orderId: string;

    // Invoice ID
    @ApiProperty({
        example: '5f6c573058ab834051b557a5',
        description: 'Invoice id provided by Xendit API',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    invoiceId?: string;

    // User ID
    @ApiProperty({
        example: '5f6c573058ab834051b557a5',
        description: 'Buyer ID',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    user?: string;

    // Amount
    @ApiProperty({
        example: '3000000',
        description: 'Total amount of purchasing product',
        format: 'number'
    })
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    // Payer email
    @ApiProperty({
        example: 'iamaul@hotmail.com',
        description: 'Customer email',
        format: 'string'
    })
    @IsNotEmpty()
    @IsEmail()
    payer_email: string;

    // Description
    @ApiProperty({
        example: 'Program Mastery - Webinar',
        description: 'Order description',
        format: 'string'
    })
    @IsString()
    description: string;

    // Cart
    @ApiProperty({
        example: 'Items',
        description: 'Cart',
        format: 'array'
    })
    cart: ICart;

    // Address
    @ApiProperty({
        example: 'Address',
        description: 'Shipping address',
        format: 'array'
    })
    address: Address[];

    // Invoice URL
    @ApiProperty({
        example: 'Invoice url',
        description: 'Invoice url',
        format: 'string'
    })
    @IsString()
    invoice_url: string;

    // Expired date
    @ApiProperty({
        example: '2020-09-25T13:14:11.354Z',
        description: 'Expiry date',
        format: 'date'
    })
    expiry_date: Date;

    // Invoice date created
    @ApiProperty({
        example: '2020-09-24T13:14:11.459Z',
        description: 'Invoice date created',
        format: 'date'
    })
    created_at: Date;

    // Invoice date updated
    @ApiProperty({
        example: '2020-09-24T13:14:11.459Z',
        description: 'Invoice date updated',
        format: 'date'
    })
    updated_at: Date;
}   