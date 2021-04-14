import { Injectable, NotFoundException, BadRequestException, NotImplementedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';

import { IOrder } from '../interfaces/order.interface';
// import { fibonacci, nextHours } from 'src/utils/helper';
import { OptQuery } from 'src/utils/OptQuery';
import { IProfile } from 'src/modules/profile/interfaces/profile.interface';
import { IProduct } from 'src/modules/product/interfaces/product.interface';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class OrderCrudService {
    constructor(
        @InjectModel('Order') private orderModel: Model<IOrder>,
        @InjectModel('Profile') private profileModel: Model<IProfile>,
        @InjectModel('Product') private productModel: Model<IProduct>,
    ) {}

    // Get All Order / Checkout 
    async findAll(
        options: OptQuery, 
        payment_method: string, 
        payment_vendor: string, 
        order_status: string, 
        invoice_number: string, 
        utm: string
    ) {
        const {
			offset,
			limit,
			sortby,
			sortval
		} = options;

		const offsets = offset == 0 ? offset : (offset - 1)
		const skip = offsets * limit
		const sortvals = (sortval == 'asc') ? 1 : -1

		var sort:any = { create_date: -1 }

		if (sortby){
			sort = { [sortby]: sortvals }
		}

        var match:any = {}

        if(payment_method){
            match= {...match, "payment.method.info": payment_method}
        }

        if(payment_vendor){
            match= {...match, "payment.method.vendor": payment_vendor}
        }

        if(order_status){
            match = {...match, "status": order_status}
        }

        if(invoice_number){
            match = {...match, "invoice": invoice_number}
        }

        if(utm){
            match = {...match, "items.utm": utm}
        }

        var result = await this.orderModel
        .find(match)
        .populate('user_info', ['_id', 'name', 'email'])
        .populate('payment.method', ['_id', 'name', 'vendor', 'icon'])
        .populate({
            path: 'items.product_info',
            select: [
                '_id', 'name', 'slug', 'code', 'type', 
                'visibility', 'price', 'sale_price',
                'bump', 'ecommerce', 'time_period'
            ],
            populate: [
                {
                    path: 'topic',
                    select: ['_id', 'name', 'slug', 'icon']
                },
                {
                    path: 'agent',
                    select: ['_id', 'name']
                }
            ]
        })
        .skip(Number(skip))
        .limit(Number(limit))
        .sort(sort)

        return Promise.all(result.map(async(val:any) => {
            val = val.toObject()
            delete val.email_job

            if(val.payment){
                delete val.payment.invoice_url;
                delete val.payment.payment_code;
                delete val.payment.pay_uid;
                delete val.payment.phone_number;
                delete val.payment.callback_id;
            }
            
            if(val.user_info){
                const profile = await this.profileModel.findOne({user: val.user_info._id})
                
                val.user_info.phone_number = !profile ? [] : profile.phone_numbers
                val.user_info.address = !profile ? [] : profile.address
            }

            const status = val.status
            const expired = val.expiry_date

            if(status == 'PENDING' || status == 'UNPAID'){
                const ex = !expired ? null : expired.getTime()
                const now = new Date().getTime()

                if(now > ex){
                    val.status == 'EXPIRED'
                    await this.orderModel.findByIdAndUpdate(val._id, { status: 'EXPIRED' })
                }
            }

            return val
        }))
    }

    // Update status Order
    async updateStatus(orderId: string, status: string){
        const inStatus = ['PAID', 'UNPAID', 'EXPIRED', 'PENDING']
        if(!inStatus.includes(status)){
            throw new BadRequestException(`available status is [${inStatus}]`)
        }

        let result;
        try{
		    result = await this.orderModel.findById(orderId);
		}catch(error){
		    throw new NotFoundException(`id order format is invalid`);
		}

		if(!result){
			throw new NotFoundException(`Could nod find order with id ${orderId}`);
        }
        
        await this.orderModel.findOneAndUpdate(
            { _id: ObjectId(orderId) },
            { $set: {status} },
            { new: true, upsert: true }
        )

        return await this.orderModel.findOne({ _id: orderId });
    }

    async updateStatusByInvoice(invoice: string, status: string){
        let result = await this.orderModel.findOne({invoice: invoice});

		if(!result){
			throw new NotFoundException(`Could nod find order with invoice: ${invoice}`);
        }
        
        await this.orderModel.findOneAndUpdate(
            { invoice: invoice },
            { $set: {status} },
            { new: true, upsert: true }
        )

        return await this.orderModel.findOne({ invoice: invoice });
    }

    // Remove Order
    async drop(orderId: string) {
        const order = await this.orderModel.findById(orderId).populate('items.product_info', ['_id', 'type', 'ecommerce'])
        if(!order) throw new NotFoundException('order not found')
        if(order.status !== 'EXPIRED') throw new BadRequestException('Only orders with the status: EXPIRED, can be deleted')
        
        try {
            order.items.map(async(res) => {
                if(res.product_info.type == 'ecommerce'){
                    await this.productModel.findByIdAndUpdate(res.product_info._id, {
                        $inc: {'ecommerce.stock': res.quantity}
                    })
                }
            })

            await this.orderModel.deleteOne({ _id: ObjectId(orderId) })
            // await this.orderModel.findByIdAndUpdate(orderId, { status: 'EXPIRED' })
            return 'ok'
        } catch (error) {
            throw new NotImplementedException("the order can't deleted")
        }
    }

    // Get Users Order | To User
    async myOrder(user: any, status: string, inStatus: any, isSubscribe: any) {
        // const fibo = fibonacci(2, 4, 3)
        // nextHours(new Date(), 1)

        const sort = { create_date: -1 }

        var result = await this.orderModel
        .find({user_info: user._id})
        .populate('payment.method', ['_id', 'name', 'vendor', 'icon'])
        .populate({
            path: 'items.product_info',
            select: [
                '_id', 'name', 'slug', 'code', 'type', 
                'visibility', 'price', 'sale_price',
                'bump', 'ecommerce', 'time_period'
            ],
            populate: [
                {
                    path: 'topic',
                    select: ['_id', 'name', 'slug', 'icon']
                },
                {
                    path: 'agent',
                    select: ['_id', 'name']
                }
            ]
        })
        .sort(sort)

        Promise.all(result.map(async(val) => {
            val = val.toObject()
            delete val.user_info
            delete val.email_job
            if(val.payment){
                delete val.payment.invoice_url;
                delete val.payment.payment_code;
                delete val.payment.pay_uid;
                delete val.payment.phone_number;
                delete val.payment.callback_id;
            }

            const status = val.status
            const expired = val.expiry_date

            if(status == 'PENDING' || status == 'UNPAID'){
                const ex = !expired ? null : expired.getTime()
                const now = new Date().getTime()

                if(now > ex){
                    val.status == 'EXPIRED'
                    await this.orderModel.findByIdAndUpdate(val._id, { status: 'EXPIRED' })
                }
            }

            return val
        }))

        if(status){
            if(inStatus === false || inStatus === 'false'){
                result = result.filter(val => val.status != status)
            }else{
                result = result.filter(val => val.status == status)
            }
        }

        if(isSubscribe == false || isSubscribe == 'false'){
            result = result.filter(val => val.items.find(res => res.product_info.time_period == 0))
        }

        return result
    }
}
