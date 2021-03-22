import {
    IsNotEmpty,
    IsString,
    IsEmail,
    IsObject,
    IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DanaOrderDTO {
    @ApiProperty({
        example: 80000,
        description: 'Total Price in order',
        format: 'number'
    })
    @IsNotEmpty()
    @IsNumber()
    total_price: number;
}

export class OrderNotifyDTO {
    @ApiProperty({
        example: "854167070911",
        description: 'Merchant Transaction ID. by Dana',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    merchant_trans_id: string;

    @ApiProperty({
        example: "20210308111212800110166775438974846",
        description: 'DANA transaction id. by Dana',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    acquirement_id: string;
    
    @ApiProperty({
        example: 80000,
        description: 'Total Price in order',
        format: 'number'
    })
    @IsNotEmpty()
    @IsNumber()
    total_price: number;

    @ApiProperty({
        example: "19321SKU1916480",
        description: 'Invoice number from order',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    invoice_number: string;

    @ApiProperty({
        example: "https://m.dana.id/m/portal/cashier/checkout?bizNo=20210319111212800110166132339732154&timestamp=1616137619431&originSourcePlatform=IPG&mid=216620000137450311905&sign=NbBRAg5jonkK2b1gC59RixGcTZRYgVPpbAgmQ3BYV5oKXlRqMgT2KIdfk4IEawg5V3Sz%2Fdq4VJv0Rfeap9n%2FYzx2sFvVU%2BA01mJkQ8et%2FtDhgJoOw4CF3MBUV95sElOoqt3eOcZazgJEw9QwvLBzIfZV4W03IzEe5H9kTYvEtjM6sF7l4JGF0OVbXCfa%2FS6iTE4x7Cfs9wG8%2FR07jQB4I2rqyZf7XKTdIBWEcnoqZHys2Llcts%2Bt3IBfcgwE3xC42UjDHJupsHVJGNUOQ3MToKspgzHvF7hJ%2Bc7%2BSaaWkd1zT7rcb9bseHLDRdYRwNADi0CdD32j1XnxsRpOFcCiOQ%3D%3D",
        description: 'checkout url from order',
        format: 'string'
    })
    checkout_url: string;

    @ApiProperty({
        example: "60055b539780220011f67279",
        description: 'User ID',
        format: 'string'
    })
    user_id: string;
}