import { 
    IsNotEmpty,
    IsString,
    IsNumber,
    IsEnum
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum EnumType { 
	MANDIRI = 'MANDIRI', 
	BNI = 'BNI', 
	BRI = 'BRI', 
    PERMATA = 'PERMATA',
    BCA = 'BCA',
}

export class PayRO_Dto {

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'xxxxxxxxxxxx',
        description: 'ID From Payment Type (Payment Method)',
        format: 'string'
    })
    payment_type: string;

    // @ApiProperty({
    //     example: 'ALFAMART',
    //     description: 'Retail Outlet inputed if payment method is Retail Outlet (RO)',
    //     format: 'number'
    // })
    retail_outlet_name: string;

    @ApiProperty({
        example: 'Ananda Nicola',
        description: 'Bank Account ownership name',
        format: 'string'
    })
    account_name: string;

    @ApiProperty({
        example: 300000,
        description: 'Expected Amount (IDR)',
        format: 'number'
    })
    expected_amount: number;
}

export class PaymentAccountDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'xxxxxxxxxxxx',
        description: 'ID From Payment Type (Payment Method)',
        format: 'string'
    })
    payment_type: string;

    pa_id: string;
    external_id: string;
    payment_id: string;
    payment_code: string;

    @ApiProperty({
        example: 'ALFAMART',
        description: 'Retail Outlet inputed if payment method is Retail Outlet (RO)',
        format: 'number'
    })
    retail_outlet_name: string;
	user_id: string;
    
    // @IsNotEmpty()
    // @IsNumber()
    @ApiProperty({
        example: 300000,
        description: 'Expected Amount (IDR)',
        format: 'number'
    })
    expected_amount: number;
    
    // @IsNotEmpty()
    // @IsString()
    // @IsEnum(EnumType, { message: 'Type value is: MANDIRI, BNI, BRI, PERMATA, BCA' })
    // @ApiProperty({
    //     example: 'BNI',
    //     description: 'Bank Kode',
    //     enum: [ 'MANDIRI', 'BNI', 'BRI', 'PERMATA', 'BCA']
    // })
    bank_code: string;
    
    @ApiProperty({
        example: '08989900282',
        description: 'Phone Number',
        format: 'number'
    })
    phone_number: string;
    
    // @IsNotEmpty()
    // @IsString()
    @ApiProperty({
        example: 'Ananda Nicola',
        description: 'Bank Account ownership name',
        format: 'string'
    })
    account_name: string;
    
    // @IsNotEmpty()
    // @IsString()
    @ApiProperty({
        example: '8010225509',
        description: 'Bank Account ownership name if payment method is Virtual Account (BRI, BCA, Mandiri, etc)',
        format: 'string'
    })
    account_number: string;
    
    // @IsNotEmpty()
    // @IsString()
    @ApiProperty({
        example: 'ananda@gmail.com',
        description: 'Email to follow up notification',
        format: 'string'
    })
    account_email: string;
    
    @ApiProperty({
        example: '1234',
        description: 'Card CVN if payment method is Card Credit (Visa, MasterCard, etc)',
        format: 'string'
    })
    card_cvn: string;
    expiry: Date;
}