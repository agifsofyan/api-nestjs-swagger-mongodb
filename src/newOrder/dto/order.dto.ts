import { IsEmail, IsNotEmpty, IsNumber, IsString, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

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
    user_id: string;

    // @IsNotEmpty()
    @ApiProperty({
        example: [{
            product_id: "5f7c32bed623b700b9b751bb",
            variant: "blue",
            note: "something note to shop",
            is_bump: false,
            quantity: 2,
        },{
            product_id: "5f801051a870fe0070637c64",
            quantity: 1
        }],
        description: 'Items from cart to order',
        format: 'Array Of Object'
    })
    items: [{
        product_id: string,
        variant: string,
        note: string,
        is_bump: boolean,
        is_shipment: boolean,
        quantity: number,
        bump_price: number,
        sub_price: number
    }];

    @ApiProperty({
        example: { 
	    coupon_id: "xxxxxxxxxxxxxxxxxxx reference from coupon_id"
	},
        description: 'Coupon ID',
        format: 'object'
    })
    coupon: {
	    coupon_id: any
    };

    @ApiProperty({
        example: {
            method: '5f969313970708276038afe5 - reference from payment method',
            phone_number: '08989900181'
        },
        description: 'Xendit payment gateway',
        format: 'object'
    })
    payment: {
        method: { id: string, name: string, info: string },
        phone_number: string,
        status: string,
        
        pay_uid: string,
        external_id: string,
        payment_id: string,
        payment_code: string,
        callback_id: string,
    };

    @ApiProperty({
        example: {
            address_id: '5face99e4b34ba1d647c9196 address id reference from user address'
        },
        description: 'Shipment to courier order',
        format: 'object'
    })
    shipment: {
        address_id: any,
        payment_id: any
    };

    total_qty: number;
    total_price: number;
    invoice: string;
    create_date: string;
    expiry_date: Date;

    status: string;
}