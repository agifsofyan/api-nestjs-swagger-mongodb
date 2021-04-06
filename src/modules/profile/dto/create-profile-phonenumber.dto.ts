import { IsBoolean, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ProfilePhoneNumberDTO {
    // Country Code
    @ApiProperty({
        example: '+62',
        description: 'Country code',
        format: 'string',
        default: '+62'
    })
    @IsString()
    country_code: string;

    // Mobile number
    @ApiProperty({
        example: '8989900272',
        description: 'Phone Number',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    phone_number: string;

    // Default Mobile Number
    @ApiProperty({
        example: true,
        description: 'Set Phone Number to default',
        format: 'boolean',
        default: true
    })
    @IsNotEmpty()
    @IsBoolean()
    isDefault: boolean;

    // Note
    @ApiProperty({
        example: 'Simpati',
        description: 'Note to mobile Number. Optional',
        format: 'string',
    })
    @IsString()
    note: string;
}