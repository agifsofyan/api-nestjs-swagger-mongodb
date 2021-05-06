import { IsEmail, IsNotEmpty, IsNumber, IsString, IsEnum, IsBooleanString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum StatusOrder {
	PENDING = 'PENDING',
	UNPAID = 'UNPAID',
	PAID = 'PAID',
	EXPIRED = 'EXPIRED',
}

export enum PaymentOrder {
	BANK_TRANSFER = 'Bank-Transfer',
	EWALLET = 'EWallet',
	VIRTUAL_ACCOUNT = 'Virtual-Account',
    CREDIT_CARD = 'Credit-Card',
    RETAIL_OUTLET='Retail-Outlet',
}

export enum PaymentVendor {
	LARUNO="Laruno",
    DANA="Dana",
    XENDIT="Xendit",
}

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
            product_id: "5fc721a51712590aa05641b5",
            variant: "blue",
            note: "something note to shop",
            is_bump: false,
            quantity: 2,
            utm: 'origin'
        },{
            product_id: "5fc721931712590aa05641b1",
            quantity: 1,
            utm: 'facebook'
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
        sub_price: number,
        utm: string
    }];

    @ApiProperty({
        example: { 
            code: "3CMUDF"
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
            address_id: '5fbdcf86a41005439063bfcb',
            price: 9000
        },
        description: 'Shipment to courier order',
        format: 'object'
    })
    shipment?: {
        price?: number,
        address_id?: any,
        shipment_info?: any
    };

    sub_total_price: number;
    total_bump: number;
    discount_value: number;
    total_qty: number;

    @ApiProperty({
        example: 242000,
        description: 'Total price',
        format: 'number',
        required: true
    })
    @IsNotEmpty()
    @IsNumber()
    total_price: number;

    invoice: string;
    expiry_date: Date;

    status: string;
}