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

export class PaymentAccountDto {
    @IsNotEmpty()
    @IsString()
    payment_type: string;

    pa_id: string;
    external_id: string;
    payment_id: string;
    payment_code: string;
    retail_outlet_name: string;
	user_id: string;
    
    @IsNotEmpty()
    @IsNumber()
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
    
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'Ananda Nicola',
        description: 'Bank Account ownership name',
        format: 'string'
    })
    account_name: string;
    
    // @IsNotEmpty()
    // @IsString()
    @ApiProperty({
        example: '8010225508',
        description: 'Bank Account ownership name',
        format: 'string'
    })
    account_number: string;
    
    // @IsNotEmpty()
    // @IsString()
    @ApiProperty({
        example: 'ananda$gmail.com',
        description: 'Email to follow up notification',
        format: 'string'
    })
    account_email: string;
    
    card_cvn: string;
    expiry: Date;
}