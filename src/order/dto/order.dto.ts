import { IsEmail, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

import { Address } from "../interfaces/order-address.interface";
// import { Cart } from "../../utils/cart";
import { InvoiceStatus } from "../../utils/enum";

// export class OrderDTO {
//     // Order ID
//     @ApiProperty({
//         example: '#ORDER-1271318BAS',
//         description: 'Generate order id by random string',
//         format: 'string'
//     })
//     @IsNotEmpty()
//     @IsString()
//     order_id: string;

//     // Invoice ID
//     @ApiProperty({
//         example: '5f6c573058ab834051b557a5',
//         description: 'Invoice id provided by Xendit API',
//         format: 'string'
//     })
//     @IsNotEmpty()
//     @IsString()
//     invoice_id: string;

//     // User ID
//     @ApiProperty({
//         example: '5f6c573058ab834051b557a5',
//         description: 'Buyer ID',
//         format: 'string'
//     })
//     @IsNotEmpty()
//     @IsString()
//     user?: string;

//     // Status
//     @ApiProperty({
//         example: 'PENDING',
//         description: 'Payment status',
//         format: 'string'
//     })
//     @IsNotEmpty()
//     status: InvoiceStatus;

//     // Merchant Name
//     @ApiProperty({
//         example: 'LARUNO',
//         description: 'Merchant name provided by Xendit API',
//         format: 'string'
//     })
//     @IsNotEmpty()
//     @IsString()
//     merchant_name: string;

//     // Merchant Logo
//     @ApiProperty({
//         example: 'LARUNO',
//         description: 'Merchant logo provided by Xendit API',
//         format: 'string'
//     })
//     @IsNotEmpty()
//     @IsString()
//     merchant_profile_picture_url: string;

//     // Currency
//     @ApiProperty({
//         example: 'IDR',
//         description: 'Currency',
//         format: 'string'
//     })
//     @IsNotEmpty()
//     @IsString()
//     currency: string;

//     // Amount
//     @ApiProperty({
//         example: '3000000',
//         description: 'Total amount of purchasing product',
//         format: 'number'
//     })
//     @IsNotEmpty()
//     @IsNumber()
//     amount: number;

//     // Payer email
//     @ApiProperty({
//         example: 'iamaul@hotmail.com',
//         description: 'Customer email',
//         format: 'string'
//     })
//     @IsNotEmpty()
//     @IsEmail()
//     payer_email: string;

//     // Description
//     @ApiProperty({
//         example: 'Program Mastery - Webinar',
//         description: 'Order description',
//         format: 'string'
//     })
//     @IsString()
//     description: string;

//     // Invoice URL
//     @ApiProperty({
//         example: 'Invoice url',
//         description: 'Invoice url',
//         format: 'string'
//     })
//     @IsString()
//     invoice_url: string;

//     // Expired date
//     @ApiProperty({
//         example: '2020-09-25T13:14:11.354Z',
//         description: 'Expiry date',
//         format: 'date'
//     })
//     expiry_date: Date;

//     // Cart
//     // @ApiProperty({
//     //     example: 'Items',
//     //     description: 'Cart',
//     //     format: 'array'
//     // })
//     // cart: Cart;

//     // Address
//     @ApiProperty({
//         example: 'Address',
//         description: 'Shipping address',
//         format: 'array'
//     })
//     address: Address[];

//     // Invoice date created
//     @ApiProperty({
//         example: '2020-09-24T13:14:11.459Z',
//         description: 'Invoice date created',
//         format: 'date'
//     })
//     created_at: Date;

//     // Invoice date updated
//     @ApiProperty({
//         example: '2020-09-24T13:14:11.459Z',
//         description: 'Invoice date updated',
//         format: 'date'
//     })
//     updated_at: Date;
// }

export class SearchDTO {
    // Search
    @IsNotEmpty()
    @ApiProperty({
        example: "Bisnis",
        description: 'Search By Name or Description',
        format: 'string'
    })
    search: string;
}

export class OrderDto {
    // user_id: string;

    items: [{
        product_id: string,
        variant: string,
        note: string,
        shipment_id: string,
        quantity: number,
        // sub_price: number,
    }];

    coupon_id: string;
    payment_id: string;
    // total_qty: number;
    // total_price: number;
    // invoice: string;
    // expiry_date: Date;
    // status: string;
}