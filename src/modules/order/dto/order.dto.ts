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
            product_id: "5f7c362fd623b700b9b751c2",
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
            code: "c12020 reference from coupon_id"
	    },
        description: 'Coupon ID',
        format: 'object'
    })
    coupon: {
        name: string,
        code: string,
        value: number,
        max_discount: number
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
        shipment_info: any
    };

    total_qty: number;
    total_price: number;
    invoice: string;
    create_date: string;
    expiry_date: Date;

    status: string;
}