import {
    IsNotEmpty,
    IsString,
    IsEmail,
    IsObject,
    IsNumber
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DanaOrderDTO {
    // User Id
    // @ApiProperty({
    //     example: 'sdsdsdscxcddcd',
    //     description: 'User ID',
    //     format: 'string'
    // })
    // userId: string;

    // User - Name
    // @ApiProperty({
    //     example: {
    //         name: 'Nindo'
    //     },
    //     description: 'User Name',
    //     format: 'object'
    // })
    // @IsNotEmpty()
    // @IsObject()
    // user: object;

    // Order - Price
    @ApiProperty({
        example: '80000',
        description: 'Total Price in order',
        format: 'string'
    })
    @IsNotEmpty()
    // @IsObject()
    total_price: object;
    
    // Phone_number
    // @ApiProperty({
    //     example: '081212408246',
    //     description: 'Phone number',
    //     format: 'string'
    // })
    // @IsString()
    // phone_number: string;
}