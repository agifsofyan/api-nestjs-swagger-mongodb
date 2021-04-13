import * as mongoose from 'mongoose';

import { expiring } from 'src/utils/order';

export const ShipmentSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    service_type: { 
        type: String,
        enum: [ "Parcel", "Document", "Return", "Marketplace", "Corporate", "Bulky", "International" ], 
        default: "Parcel"
    },
    service_level: { 
        type: String,
        enum: [ "Standard", "Express", "Sameday", "Nextday" ],
        default: "Standard"
    },
    requested_tracking_number: String,
    reference: {
        merchant_order_number: String
    },
    from: {
        name: String,
        phone_number: String,
        email: String,
        address: {
            address_type: { 
                type: String,
                enum: [ "home", "office" ], 
                default: "office" 
            },
            country: { 
                type: String,
                enum: [ "SG", "MY", "TH", "ID", "VN", "PH", "MM" ], 
                default: "ID"
            },
            detail: String,
            province: String,
            city: String,
            subdistrict: String,
            // village: String,
            postcode: String
        }
    },
    to: {
        name: String,
        phone_number: String,
        email: String,
        address: {
            address_type: { 
                type: String,
                enum: [ "home", "office" ], 
                default: "home" 
            },
            country: { 
                type: String,
                enum: [ "SG", "MY", "TH", "ID", "VN", "PH", "MM" ], 
                default: "ID"
            },
            detail: String,
            province: String,
            city: String,
            subdistrict: String,
            // village: String,
            postcode: String
        }
    },
    parcel_job: {
        is_pickup_required: { type: Boolean, default: false },
        pickup_service_type: { 
            type: String,
            enum: [ "Scheduled", "On-Demand" ],
            default: "Scheduled" 
        },
        pickup_service_level: { 
            type: String,
            enum: [ "Standard", "Premium" ], 
            default: "Standard" 
        },
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
