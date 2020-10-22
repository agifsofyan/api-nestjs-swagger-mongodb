import { 
    IsNotEmpty,
    IsNumber,
    IsString,
    IsBooleanString,
    IsDateString,
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

export class VaDto {
    
    ip: string;
    currency: string;
    
    @IsNotEmpty()
    @IsString()
    @IsEnum(EnumType, { message: 'Type value is: MANDIRI, BNI, BRI, PERMATA, BCA' })
    @ApiProperty({
        example: 'BNI',
        description: 'Bank Kode',
        enum: [ 'MANDIRI', 'BNI', 'BRI', 'PERMATA', 'BCA']
    })
    bank_code: string;

    merchant_code: string;
    
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'Ananda Nicola',
        description: 'Bank Account ownership name',
        format: 'string'
    })
    name: string;

    @ApiProperty({
        example: '107669999223454',
        description: 'Virtual Account Number',
        format: 'string',
        required: false,
    })

    account_number: string;

    is_single_use: Boolean;
    expiration_date: Date;
    external_id: string;
    owner_id: string;
    user_id: string;
    va_id: string;
}