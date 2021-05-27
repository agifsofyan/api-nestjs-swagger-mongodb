import { Injectable, NotFoundException, BadRequestException, NotImplementedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';

import { IOrder } from '../interfaces/order.interface';
// import { fibonacci, nextHours } from 'src/utils/helper';
import { OptQuery } from 'src/utils/OptQuery';
import { IProfile } from 'src/modules/profile/interfaces/profile.interface';
import { IProduct } from 'src/modules/product/interfaces/product.interface';
import { IFollowUp } from 'src/modules/followup/interfaces/followup.interface';
import { ITemplate } from 'src/modules/templates/interfaces/templates.interface';
import { IBankTransfer } from 'src/modules/payment/banktransfer/interfaces/banktransfer.interface';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class OrderCrudService {
    constructor(
        @InjectModel('Order') private orderModel: Model<IOrder>,
        @InjectModel('Profile') private profileModel: Model<IProfile>,
        @InjectModel('Product') private productModel: Model<IProduct>,
        @InjectModel('FollowUp') private followModel: Model<IFollowUp>,
        @InjectModel('Template') private templateModel: Model<ITemplate>,
        @InjectModel('BankTransfer') private transferModel: Model<IBankTransfer>,
    ) {}

    private async getFollowUp(orderID: string) {
        const order = await this.orderModel.findById(orderID)
	.populate('user_info', ['_id', 'name', 'email'])
		
	if(!order) throw new NotFoundException(`order with id: ${orderID} not found`)

	const activity = []
			
	for(let i=0; i<5; i++){
		let messageTemplate = await this.templateModel.findOne({ name: `followup${i+1}` }).then(res => {
		const result = res.versions.filter(val => val.active === true)
			return result[0].template
		})
	
		activity[i] = {
			date: null,
			message: messageTemplate.replace('{{name}}', order.user_info.name).replace('{{total_price}}', order.total_price.toString()), 
			is_done: false
		}
	}

	const followUp = {
		user: order.user_info._id,
		order: ObjectId(orderID),
		activity: activity
	}
			
	await this.followModel.findOneAndUpdate(
		{ order: orderID },
		{ followUp },
		{ upsert: true, new: true }
	)
	
	return await this.followModel.findOne({ order: orderID })
    }

    // Get All Order
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

        var result:any = await this.orderModel
        .find(match)
        .populate('user_info', ['_id', 'name', 'email'])
        .populate('payment.method', ['_id', 'name', 'vendor', 'icon'])
        .populate({
            path: 'items.product_info',
            select: [
                '_id', 'name'
            ],
        })
        .populate('shipment.shipment_info', [
            '_id', 'service_type', 'service_level', 'requested_tracking_number', 'from', 'to', 'parcel_job.pickup_date', 'pickup_service_level', 'parcel_job.delivery_start_date', 'dimensions'
        ])
        .skip(Number(skip))
        .limit(Number(limit))
        .sort(sort)

        const results = result.map(async(res): Promise<any> => {
            var val = res.toObject()
            delete val.email_job

            const profile = await this.profileModel.findOne({user: val.user_info._id}).select(['phone_numbers'])

            val.user_info.whatsapp = ''
            val.user_info.sms = ''
            
            if(profile){
                const wa = profile.phone_numbers.filter(el => el.isWhatsapp == true)
                const sms = profile.phone_numbers.filter(el => el.isDefault == true)
                val.user_info.whatsapp = wa.length > 0 ? wa[0].country_code+wa[0].phone_number : '';
                val.user_info.sms = sms.length > 0 ? sms[0].country_code+sms[0].phone_number : '';
            }

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

            val.transfer_evidence = await this.transferModel.findOne({ invoice_number: val.invoice })
            .select(['_id', 'destination_bank', 'destination_account', 'destination_number', 'is_confirmed', 'transfer_date', 'bank_name', 'account_owner_name', 'account_number', 'struct_url'])

            val.followup = await this.getFollowUp(val._id)

            return val
        })
        
        return await Promise.all(results)
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
        var match:any = { user_info: user._id }

        if(status){
            if(inStatus === false || inStatus === 'false'){
                match.status = { $nin: [status] }
            }else{
                match.status = status
            }
        }

        var result:any = await this.orderModel
        .find(match)
        .populate('payment.method', ['_id', 'name', 'vendor', 'icon', 'invoice_url'])
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
        .populate('user_info', ['_id', 'name', 'email'])
        .populate('coupon', ['_id', 'name', 'code', 'value'])
        .populate('shipment.shipment_info', ['_id', 'service_type', 'service_level', 'requested_tracking_number', 'from', 'to', 'parcel_job.pickup_date', 'parcel_job.delivery_start_date', 'parcel_job.dimensions'])
        .sort(sort)

        if(isSubscribe == false || isSubscribe == 'false'){
            result = result.filter(val => val.items.find(res => res.product_info.time_period == 0))
        }

        result = Promise.all(result.map(async(el) => {
            var val = el.toObject()
            delete val.user_info
            delete val.email_job
            if(val.payment){
                delete val.payment.payment_code;
                delete val.payment.pay_uid;
                delete val.payment.phone_number;
                delete val.payment.callback_id;
            }

            if(val.coupon){
                delete val.coupon['payment_method']
                delete val.coupon['product_id']
                delete val.coupon['tag']
                delete val.coupon['tag']
            }

            if(val.shipment){
                if(!val.shipment.shipment_info){
                    delete val.shipment
                }
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

        return result
    }

    async detail(order_id:string) {
        var query = await this.orderModel.findOne({_id: order_id})

        var order = query.toObject()
        const profile = await this.profileModel.findOne({user: order.user_info._id}).select(['phone_numbers'])
        const wa = profile.phone_numbers.filter(el => el.isWhatsapp == true)
        const sms = profile.phone_numbers.filter(el => el.isDefault == true)
        order.user_info.whatsapp = wa.length > 0 ? wa[0].country_code+wa[0].phone_number : '';
        order.user_info.sms = sms.length > 0 ? sms[0].country_code+sms[0].phone_number : '';

        return order
    }
}
