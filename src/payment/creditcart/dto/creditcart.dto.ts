import { 
    IsNotEmpty, 
    IsNumberString,
    IsBooleanString
} from 'class-validator';

export class CreditCartDto {
    @IsNumberString()
    @IsNotEmpty()
    amount: number;
    
    @IsNumberString()
    @IsNotEmpty()
    card_number: number;
    
    @IsNumberString()
    @IsNotEmpty()
    card_exp_month: number;

    @IsNumberString()
    @IsNotEmpty()
    card_exp_year: number;
    
    @IsNumberString()
    card_cvn: number;

    @IsBooleanString()
    is_multiple_use: boolean;

    @IsBooleanString()
    should_authenticate: boolean;
}