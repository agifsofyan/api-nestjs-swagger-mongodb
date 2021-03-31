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

    country: string;

    // Province
    @ApiProperty({
        example: 114,
        description: 'Province id (Id Provinsi)',
        format: 'number'
    })
    @IsNotEmpty()
    @IsNumber()
    province_id: number;
    province: string;

    // City/State
    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        example: 112,
        description: 'City id or state (Kota / Kabupaten)',
        format: 'number'
    })
    city_id: number;
    city: string;

    // Sub District --> Kecamatan
    @ApiProperty({
        example: 344,
        description: 'District (Kecamatan)',
        format: 'number'
    })
    // @IsNotEmpty()
    @IsNumber()
    subdistrict_id: number;
    subdistrict: string;

    // Postal Code
    postal_code: number;

    // Address
    @ApiProperty({
        example: 'Jl. Scientia Boulevard, Gading Serpong',
        description: 'Full address',
        format: 'string'
    })
    @IsString()
    detail_address: string;
}