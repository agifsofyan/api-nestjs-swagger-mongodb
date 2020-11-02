import { 
    IsNotEmpty,
    IsString,
    IsNumber,
    IsEnum,
    MinLength,
    Min
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum EnumType { 
	MANDIRI = 'MANDIRI', 
	BNI = 'BNI', 
	BRI = 'BRI', 
    PERMATA = 'PERMATA',
    BCA = 'BCA',
}

/** Retail Outlet */
export class PayRO_Dto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'xxxxxxxxxxxx',
        description: 'ID From Payment Type (Payment Method)',
        format: 'string'
    })
    payment_type: string;

    retail_outlet_name: string;

    @ApiProperty({
        example: 'Ananda Nicola',
        description: 'Bank Account ownership name',
        format: 'string'
    })
    account_name: string;

    @IsNumber()
    @Min(10000)
    @ApiProperty({
        example: 300000,
        description: 'Expected Amount (IDR)',
        format: 'number'
    })
    expected_amount: number;
}

/** Virtual Account */
export class PayVA_Dto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'xxxxxxxxxxxx',
        description: 'ID From Payment Type (Payment Method)',
        format: 'string'
    })
    payment_type: string;

    @ApiProperty({
        example: 'Ananda Nicola',
        description: 'Bank Account ownership name',
        format: 'string'
    })
    account_name: string;
}

/** Virtual Account */
export class PayEW_Dto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'xxxxxxxxxxxx',
        description: 'ID From Payment Type (Payment Method)',
        format: 'string'
    })
    payment_type: string;

    @IsNumber()
    @Min(10000)
    @ApiProperty({
        example: 300000,
        description: 'Expected Amount (IDR)',
        format: 'number'
    })
    expected_amount: number;

    @ApiProperty({
        example: '08989900282',
        description: 'Phone Number',
        format: 'number'
    })
    phone_number: string;
}

/** Credit Card */
export class PayCC_Dto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'xxxxxxxxxxxx',
        description: 'Credit Card Tokenization (token_id)',
        format: 'string'
    })
    token_id: string;

    @ApiProperty({
        example: 300000,
        description: 'Expected Amount (IDR)',
        format: 'number'
    })
    expected_amount: number;

    @ApiProperty({
        example: '1234',
        description: 'secure key in the credit card',
        format: 'number'
    })
    card_cvn: string;
}