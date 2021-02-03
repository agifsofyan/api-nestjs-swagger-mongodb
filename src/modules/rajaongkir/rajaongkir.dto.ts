import {
    IsNotEmpty,
    IsString,
    IsArray,
    IsNumber
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RajaOngkirCostDTO {
    // Origin
    // @ApiProperty({
    //     example: '501',
    //     description: 'Origin ID (ID Kota Asal)',
    //     format: 'string'
    // })
    origin: string;

    // Destination
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: '114',
        description: 'Destination ID (ID kota tujuan)',
        format: 'string'
    })
    destination: string;

    // weight
    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        example: 1700,
        description: 'Weight in gram',
        format: 'number'
    })
    weight: number; // in gram

    // Courier
    // @ApiProperty({
    //     example: 'jne',
    //     description: 'Courier. Only available in jne, pos, tiki',
    //     format: 'string'
    // })
    courier: string;
}