import { 
    IsNotEmpty,
    IsString
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaymentMethodDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'VA_BNI',
        description: 'Payment Method Name',
        format: 'string'
    })
    name: string;
    
    @ApiProperty({
        example: 'Virtual Account',
        description: 'Payment Method Info',
        format: 'string'
    })
    info: string;
}