import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateProfileAddressDTO {
    // Address title
    @ApiProperty({
        example: 'Office',
        description: 'Address Title',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    title: string;

    // Province
    @ApiProperty({
        example: 'Banten',
        description: 'Province',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    province_id: string;

    // City/State
    @ApiProperty({
        example: 'Kota Tangerang',
        description: 'City or state',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    city_id: string;

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
        example: 15315,
        description: 'Postal code',
        format: 'number'
    })
    @IsNotEmpty()
    @IsNumber()
    postal_code: number;
}