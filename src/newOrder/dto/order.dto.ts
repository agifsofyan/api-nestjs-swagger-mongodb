import { IsEmail, IsNotEmpty, IsNumber, IsString } from "class-validator";
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

    @IsNotEmpty()
    @ApiProperty({
        example: {
            items: [{
                product_id: "5f7c32bed623b700b9b751bb",
                variant: "blue",
                note: "something note to shop",
                is_bump: true,
                shipment_id: "acscaedd232332w2swsws",
                quantity: 2,
            },{
                product_id: "5f801051a870fe0070637c64",
                quantity: 1
            }]
        },
        description: 'Items from cart to order',
        format: 'Array Of Object'
    })
    items: [{
        product_id: string,
        variant: string,
        note: string,
        is_bump: boolean,
        shipment_id: string,
        quantity: number,
        bump_price: number,
        sub_price: number
    }];

    @ApiProperty({
        example: "xxxxxxxxxxxxxxxxxxx",
        description: 'Coupon ID',
        format: 'string'
    })
    coupon_id: string;

    @ApiProperty({
        example: {
            method: 'Ukdadferuidmlcsw - reference from payment method'
        },
        description: 'Xendit payment gateway',
        format: 'object'
    })
    payment: {
        method: string,
        account: string,
        external_id: string,
        payment_id: string,
        callback_id: string,
    };

    total_qty: number;
    total_price: number;
    invoice: string;
    expiry_date: Date;
    // status: string;
}