import { Document } from 'mongoose';

export interface IItemOrder extends Document {
    product_info: any
    variant: string
    note: string
    is_bump: boolean
    quantity: number
    bump_price: number
    sub_price: number
    utm: string
}

export interface IPaymentOrder extends Document {
    method: any;
    phone_number: number
    status: string
    pay_uid: string
    external_id: string
    payment_id: string
    payment_code: string
    callback_id: string
    invoice_url: string
}

export interface IShipmentOrder extends Document {
    address_id: any
    price: number
    shipment_info: any
}

export interface IOrder extends Document {
    user_info: any

    items: IItemOrder[]
    payment: IPaymentOrder
    shipment: IShipmentOrder
    
    total_qty: number
    total_bump: number
    coupon: string
    discount_value: number
    sub_total_price: number
    unique_number: number
    total_price: number
    invoice: string
    expiry_date: Date
    status: string

    email_job: {
        pre_payment: Array<string>, // Send Email in 3, 6, 12, 24 hours after Create order if have not paid the bill
        after_payment: string // the date when paying the order
    }
}