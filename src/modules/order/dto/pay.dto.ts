import { IsNotEmpty, IsNumber, IsObject } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class OrderPayDto {
    // Select payment gateway
    @IsNotEmpty()
    @IsObject()
    @ApiProperty({
        example: {
            method: '5fb24fc4c49a9f4adc62bceb',
            phone_number: '08989900181'
        },
        description: 'Xendit payment gateway',
        format: 'object'
    })
    payment: {
        method: { name: string, info: string }, // Required
        phone_number: string, // Optional
        
        status: string, // Not inputed
        pay_uid: string, // Not inputed
        external_id: string, // Not inputed
        payment_id: string, // Not inputed
        payment_code: string, // Not inputed
        callback_id: string, // Not inputed
        invoice_url: string,
    };

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        example: 479000,
        description: 'total number',
        format: 'number',
        required: true
    })
    total_price: number;

    @ApiProperty({
        example: 234,
        description: 'unique number',
        format: 'number',
        default: 0,
        required: true
    })
    unique_number: number;

    status: string;
}