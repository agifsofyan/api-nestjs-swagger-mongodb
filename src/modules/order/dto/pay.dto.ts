import { IsNotEmpty, IsObject } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class OrderPayDto {
    // Select payment gateway
    @IsNotEmpty()
    @IsObject()
    @ApiProperty({
        example: {
            method: '5f9692c0970708276038afdf - reference from payment method',
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
    };

    total_price: number;

    status: string;
}