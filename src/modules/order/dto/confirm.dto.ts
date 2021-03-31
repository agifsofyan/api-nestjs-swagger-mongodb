import {
    IsNotEmpty,
    IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmDTO {
    @ApiProperty({
        example: '60614144b1ae18001c457336',
        description: 'Order ID',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    id: string;

    @ApiProperty({
        example: '29321SKU6893852',
        description: 'External ID',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    exd: string;

    user_id: string;
}