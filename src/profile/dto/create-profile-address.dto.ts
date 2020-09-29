import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateProfileAddressDTO {
    // Province
    @ApiProperty({
        example: 'Banten',
        description: 'Province',
        format: 'number'
    })
    @IsNotEmpty()
    @IsNumber()
    province_id: number;

    // City/State
    @ApiProperty({
        example: 'Kota Tangerang',
        description: 'City or state',
        format: 'number'
    })
    @IsNotEmpty()
    @IsNumber()
    city_id: number;

    // Address
    @ApiProperty({
        example: 'Jl. Scientia Boulevard, Gading Serpong',
        description: 'Full address',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    detail_address: string;

    // Address
    @ApiProperty({
        example: '15315',
        description: 'Postal code',
        format: 'number'
    })
    @IsNotEmpty()
    @IsNumber()
    postal_code: number;
}