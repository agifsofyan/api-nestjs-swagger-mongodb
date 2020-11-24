import { IsNotEmpty, IsEnum, IsString, isNumber, IsArray, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ServiceType {
	Parcel = 'Parcel',
	Document = 'Document',
	Return = 'Return',
	Marketplace = 'Marketplace',
	Corporate = 'Corporate',
	Bulky = 'Bulky',
	International = 'International',
}

export enum ServiceLevel {
	Standard = 'Standard',
	Express = 'Express',
	Sameday = 'Sameday',
	Nextday = 'Nextday',
}

export enum CountriID {
    SG = "SG",
    MY = "MY",
    TH = "TH",
    ID = "ID",
    VN = "VN",
    PH = "PH",
    MM = "MM"
}

export class CreateShipmentDto {
    // Delete multiple ID or Clone Multiple Id
    @IsEnum(ServiceType, { message: '"Parcel", "Document", "Return", "Marketplace", "Corporate", "Bulky", "International"' })
    @ApiProperty({
        example: 'Parcel',
        description: 'Service Type',
        enum: [ "Parcel", "Document", "Return", "Marketplace", "Corporate", "Bulky", "International" ],
        default: "Parcel"
    })
    service_type: string

    @IsEnum(ServiceLevel, { message: 'Standard / Express / Sameday / Nextday' })
    @ApiProperty({
        example: 'Standard',
        description: 'Service Type',
        enum: [ "Standard", "Express", "Sameday", "Nextday" ],
        default: "Standard"
    })
    service_level: string

    @IsString()
    @ApiProperty({
        example: '57381',
        description: 'Service Type',
        format: 'string',
    })
    requested_tracking_number: string

    @IsString()
    @ApiProperty({
        example: "SHIP-1234-56789",
        description: 'Service Type',
        format: 'object',
    })
    merchant_order_number: string

    @IsString()
    @ApiProperty({
        example: '5face99c4b34ba1d647c9195 Reference from Address ID form User Profile -> Address',
        description: 'Reference from Address ID form User Profile -> Address',
        format: 'string'
    })
    address_id: any;

    @IsArray()
    @ApiProperty({
        example: [{
            item_description: "Something to send",
            quantity: 1,
            is_dangerous_good: false
        }],
        description: 'Reference from Address ID form User Profile -> Address',
        format: 'Array Of Object'
    })
    items: [string];
}
