import * as mongoose from 'mongoose';

import { expiring } from '../../utils/order';

export const ShipmentSchema = new mongoose.Schema({
    service_type: { type: String, default: "Parcel" },
    service_level: { type: String, default: "Standard"},
    requested_tracking_number: String,
    reference: {
        merchant_order_number: String
    },
    from: {
        name: String,
        phone_number: String,
        email: String,
        address: {
            address1: String,
            area: String,
            city: String,
            state: String,
            address_type: { type: String, default: "office" },
            country: { type: String, default: "ID" },
            postcode: String
        }
    },
    to: {
        name: String,
        phone_number: String,
        email: String,
        address: {
            address1: String,
            kelurahan: String,
            kecamatan: String,
            city: String,
            province: String,
            country: { type: String, default: "ID" },
            postcode: String
        }
    },
    parcel_job: {
        is_pickup_required: { type: Boolean, default: false },
        pickup_service_type: { type: String, default: "Scheduled" },
        pickup_service_level: { type: String, default: "Standard" },
        pickup_date: { type: Date, default: new Date() },
        pickup_timeslot: {
            start_time: { type: String, default: "09:00" },
            end_time: { type: String, default: "12:00" },
            timezone: { type: String, default: "Asia/Jakarta" }
        },
        pickup_instructions: String,
        delivery_instructions: String,
        delivery_start_date: { type: Date, default: new Date() },
        delivery_timeslot: {
            start_time: { type: String, default: "09:00" },
            end_time: { type: String, default: "12:00" },
            timezone: { type: String, default: "Asia/Jakarta" }
        },
        items: [
            {
              item_description: String,
              quantity: Number,
              is_dangerous_good: { type: Boolean, default: false },
            }
        ],
        allow_weekend_delivery: { type: Boolean, default: false },
        dimensions: {
            weight: Number
        }
    },

    created_date: { type: Date, default: new Date() },
    updated_date: { type: Date, default: new Date() },
    expired_date: { type: Date, default: expiring(7) },
},{
    collection: 'shipments',
    versionKey: false
});