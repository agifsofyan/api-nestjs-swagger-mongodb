import { 
    IsNotEmpty,
    IsString,
    IsEnum,
    IsBoolean
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export enum infoMethod {
	VirtualAccount = 'Virtual-Account',
	RetailOutlet = 'Retail-Outlet',
	EWallet = 'EWallet',
    CreditCard = 'Credit-Card',
    BankTransfer = 'Bank-Transfer',
}

export class PaymentMethodDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'VA_BNI',
        description: 'Payment Method Name',
        format: 'string'
    })
    name: string;
    
    @IsString()
    @IsEnum(infoMethod, { message: "Type value is: 'Virtual-Account', 'Retail-Outlet', 'EWallet', 'Credit-Card', 'Bank-Transfer'" })
    @ApiProperty({
        example: 'Virtual-Account',
        description: "Payment Method Info. Available in: ['Virtual-Account', 'Retail-Outlet', 'EWallet', 'Credit-Card', 'Bank-Transfer']",
        enum: ['Virtual-Account', 'Retail-Outlet', 'EWallet', 'Credit-Card', 'Bank-Transfer'],
        format: 'string'
    })
    info: infoMethod;

    @IsString()
    @ApiProperty({
        example: 'Xendit',
        description: 'Payment Gateway Vendor, like Xendit or Dana',
        format: 'string'
    })
    vendor: string;
    
    @IsBoolean()
    @ApiProperty({
        example: true,
        description: 'To set In Active or Active to this Payment Method',
        format: 'boolean'
    })
    isActive: boolean;

    @ApiProperty({
        example: 'https://no-image.com',
        description: 'Link (URL) to icon',
        format: 'string'
    })
    icon: string;
}

export class UpdateMethodDto extends PartialType(PaymentMethodDto) { }