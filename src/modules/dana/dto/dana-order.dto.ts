import {
    IsNotEmpty,
    IsString,
    IsEmail,
    IsObject
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DanaOrderDTO {
    // User Id
    @ApiProperty({
        example: 'sdsdsdscxcddcd',
        description: 'User ID',
        format: 'string'
    })
    userId: string;

    // User - Name
    @ApiProperty({
        example: {
            name: 'Nindo'
        },
        description: 'User Name',
        format: 'object'
    })
    @IsNotEmpty()
    @IsObject()
    user: object;

    // Order - Price
    @ApiProperty({
        example: {
            total_price: 80000
        },
        description: 'Total Price in order',
        format: 'object'
    })
    @IsNotEmpty()
    @IsObject()
    order: object;
}