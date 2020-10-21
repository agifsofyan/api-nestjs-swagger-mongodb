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
    // @IsNotEmpty()
    // @IsString()
    external_id: string;
    
    @IsNotEmpty()
    @IsString()
    @IsEnum(EnumType, { message: 'Type value is: MANDIRI, BNI, BRI, PERMATA, BCA' })
    @ApiProperty({
        example: 'BNI',
        description: 'Bank Kode',
        enum: [ 'MANDIRI', 'BNI', 'BRI', 'PERMATA', 'BCA']
    })
    bank_code: string;
    
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
    virtual_account_number: number;
    
    suggested_amount: number;

    is_closed: boolean;

    expected_amount: boolean;

    expiration_date: Date;

    is_single_use: Boolean;
    
    description: String;
}