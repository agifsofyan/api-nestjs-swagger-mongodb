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
    merchantTransId: string;

    @ApiProperty({
        example: "20210308111212800110166775438974846",
        description: 'DANA transaction id. by Dana',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    acquirementId: string;
    
    @ApiProperty({
        example: 80000,
        description: 'Total Price in order',
        format: 'number'
    })
    @IsNotEmpty()
    @IsNumber()
    total_price: number;

}