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
        example: 114,
        description: 'Province id (Id Provinsi)',
        format: 'number'
    })
    @IsNotEmpty()
    @IsNumber()
    province_id: number;
    // @ApiProperty({
    //     example: 'Banten',
    //     description: 'Province (Provinsi)',
    //     format: 'string'
    // })
    // @IsNotEmpty()
    // @IsString()
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
    // @ApiProperty({
    //     example: 'Kota Tangerang',
    //     description: 'City or state (Kota / Kabupaten)',
    //     format: 'string'
    // })
    // @IsNotEmpty()
    // @IsString()
    city: string;

    // District --> Kecamatan
    @ApiProperty({
        example: 'Gading Serpong',
        description: 'District (Kecamatan)',
        format: 'string'
    })
    // @IsNotEmpty()
    // @IsString()
    districts: string;

    // Sub District -- > Kelurahan
    @ApiProperty({
        example: 'Medang',
        description: 'Sub District (Kelurahan)',
        format: 'string'
    })
    // @IsNotEmpty()
    // @IsString()
    sub_district: string;

    // Address
    @ApiProperty({
        example: 'Jl. Scientia Boulevard, Gading Serpong',
        description: 'Full address',
        format: 'string'
    })
    // @IsNotEmpty()
    // @IsString()
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