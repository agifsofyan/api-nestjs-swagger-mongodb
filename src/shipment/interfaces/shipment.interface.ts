import { Document } from 'mongoose';

export interface IShipment extends Document {
    user_id: string
    service_type: string
    service_level: string
    requested_tracking_number: string

    reference: {
        merchant_order_number: string
    }

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

    created_date: Date
    updated_date: Date
}
