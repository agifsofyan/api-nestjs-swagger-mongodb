import { 
    IsNotEmpty, 
    IsPhoneNumber,
    IsNumber,
    IsString,
    MinLength,
    MaxLength,
    IsBooleanString,
    IsDateString
} from 'class-validator';

export class CreditCartDto {
	amount: number;        
    card_number: number;        
    card_exp_month: number;
    card_exp_year: number;       
    card_cvn: number;
    is_multiple_use: boolean;
    should_authenticate: boolean;
}

export class VirtualAccountDto {
    @IsNotEmpty()
    @IsString()
    external_id: string;
    
    @IsNotEmpty()
    @IsString()
    bank_code: string;
    
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNumber()
    virtual_account_number: number;
    
    @IsNumber()
    suggested_amount: number;

    @IsBooleanString()
    is_closed: boolean;

    @IsBooleanString()
    expected_amount: boolean;

    @IsDateString()
    expiration_date: Date;

    @IsBooleanString()
    is_single_use: Boolean;
    
    @IsString()
    description: String;
}