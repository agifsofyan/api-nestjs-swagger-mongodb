import { Document } from 'mongoose';

export interface OriginShipment extends Document {
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

export interface DestinationShipment extends Document {
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

export interface ItemsShipment extends Document {
    item_description: string,
    quantity: number,
    is_dangerous_good: boolean
}

export interface ParcelJobShipment extends Document {
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
    items: ItemsShipment[],
    allow_weekend_delivery: { type: boolean, default: false },
    dimensions: {
        weight: number
    }
}

export interface IShipment extends Document {
    user_id: any
    service_type: string
    service_level: string
    requested_tracking_number: string

    reference: {
        merchant_order_number: string
    }

    from: OriginShipment

    to: DestinationShipment

    parcel_job: ParcelJobShipment

    created_date: Date
    updated_date: Date
}
