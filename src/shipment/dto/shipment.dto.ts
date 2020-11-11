import { IsNotEmpty, IsEnum, IsString, isNumber, IsArray, isObject, IsObject } from 'class-validator';
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
    })
    service_type: string

    @IsEnum(ServiceLevel, { message: '"Standard", "Express", "Sameday", "Nextday"' })
    @ApiProperty({
        example: 'Parcel',
        description: 'Service Type',
        enum: [ "Standard", "Express", "Sameday", "Nextday" ],
    })
    service_level: string

    @IsString()
    @ApiProperty({
        example: '57381',
        description: 'Service Type',
        format: 'string',
    })
    requested_tracking_number: string

    @IsObject()
    @ApiProperty({
        example: { merchant_order_number: "SHIP-1234-56789" },
        description: 'Service Type',
        format: 'object',
    })
    reference: {
        merchant_order_number: string
    }
    
    @IsObject()
    @ApiProperty({
        example: {
            "name": "John FIga",
            "phone_number": "+60122222222",
            "email": "john.doe@gmail.com",
            "address": {
                "address1": "Jl. Pangeran Antasari",
                "address2": "",
                "area": "Mampang",
                "city": "Jakarta",
                "state": "DKI Jakarta",
                "address_type": "home",
                "country": "ID",
                "postcode": "15312"
            }
        },
        description: 'Address From',
        format: 'object',
    })
    from: {
        name: string
        phone_number: string
        email: string
        address: {
            address1: string,
            area: string,
            city: string,
            state: string,
            address_type: string,
            country: string,
            postcode: string
        }
    }

    @IsObject()
    @ApiProperty({
        example: {
            "name": "Jane Doe",
            "phone_number": "+6212222222222",
            "email": "jane.doe@gmail.com",
            "address": {
                "address1": "Gedung Balaikota DKI Jakarta",
                "address2": "Jalan Medan Merdeka Selatan No. 10",
                "kelurahan": "Kelurahan Gambir",
                "kecamatan": "Kecamatan Gambir",
                "city": "Jakarta Selatan",
                "province": "Jakarta",
                "country": "ID",
                "postcode": "10110"
            }
        },
        description: 'Address To',
        format: 'object',
    })
    to: {
        name: string,
        phone_number: string,
        email: string,
        address: {
            address1: string,
            kelurahan: string,
            kecamatan: string,
            city: string,
            province: string,
            country: string,
            postcode: string
        }
    }

    @IsObject()
    @ApiProperty({
        example: {
            "is_pickup_required": false,
            "pickup_address_id": 98989012,
            "pickup_service_type": "Scheduled",
            "pickup_service_level": "Standard",
            "pickup_date": "2020-10-02",
            "pickup_timeslot": {
                "start_time": "15:00",
                "end_time": "18:00",
                "timezone": "Asia/Jakarta"
            },
            "pickup_instructions": "Pickup with care!",
            "delivery_instructions": "If recipient is not around, leave parcel in power riser.",
            "delivery_start_date": "2020-10-05",
            "delivery_timeslot": {
                "start_time": "15:00",
                "end_time": "18:00",
                "timezone": "Asia/Jakarta"
            },
            "dimensions": {
                "weight": 2,
                "length": 30,
                "width": 15,
                "height": 10 
            }
        },
        description: 'parcel_job',
        format: 'object',
    })
    parcel_job: {
        is_pickup_required: boolean,
        pickup_service_type: string,
        pickup_service_level: string,
        pickup_date: Date,
        pickup_timeslot: {
            start_time: string,
            end_time: string,
            timezone: string
        },
        pickup_instructions: string,
        delivery_instructions: string,
        delivery_start_date: Date,
        delivery_timeslot: {
            start_time: string,
            end_time: string,
            timezone: string
        },
        items: [
            {
              item_description: string,
              quantity: number,
              is_dangerous_good: boolean,
            }
        ],
        allow_weekend_delivery: { type: Boolean, default: false },
        dimensions: {
            weight: Number
        }
    }

    @IsString()
    @ApiProperty({
        example: 'Parcel',
        description: 'Service Type',
        format: 'Date'
    })
    created_date: Date

    @IsString()
    @ApiProperty({
        example: 'Parcel',
        description: 'Service Type',
        format: 'Date'
    })
    updated_date: Date
}
