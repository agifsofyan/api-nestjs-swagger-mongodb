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

export interface ICouponOrder extends Document {
    name: string
    code: string
    value: number
    max_discount: number
}

export interface IPaymentOrder extends Document {
    method: {
        name: string,
        info: string,
    }
    phone_number: number
    status: string
    pay_uid: string
    external_id: string
    payment_id: string
    payment_code: string
    callback_id: string
}

export interface IShipmentOrder extends Document {
    address_id: any
    price: number
    shipment_info: any
}

export interface IOrder extends Document {
    user_info: any

    items: IItemOrder[]
    coupon: ICouponOrder
    payment: IPaymentOrder
    shipment: IShipmentOrder

    total_qty: number
    total_price: number
    invoice: string
    create_date: Date
    expiry_date: Date
    status: string
}
