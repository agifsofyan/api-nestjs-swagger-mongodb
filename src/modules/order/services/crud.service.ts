import { Injectable, NotFoundException, BadRequestException, NotImplementedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';

import { IOrder } from '../interfaces/order.interface';
// import { fibonacci, nextHours } from 'src/utils/helper';
import { OptQuery } from 'src/utils/OptQuery';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class OrderCrudService {
    constructor(
        @InjectModel('Order') private orderModel: Model<IOrder>
    ) {}

    // Get All Order / Checkout 
    async findAll(
        options: OptQuery, payment_method: string, payment_vendor: string, order_status: string, invoice_number: string, utm: string
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

        var result = await this.orderModel.aggregate([
            {$match: match},
            {$limit: !limit ? await this.orderModel.countDocuments() : Number(limit)},
			{$skip: Number(skip)},
			{$sort: sort}
        ])

        return result
    }

    async detail(order_id: string): Promise<IOrder> {
        try {
            return await this.orderModel.findById(order_id)
        } catch (error) {
            throw new NotFoundException('order not found')
        }
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
        try {
            await this.orderModel.deleteOne({ _id: ObjectId(orderId) })
            return 'ok'
        } catch (error) {
            throw new NotImplementedException("the order can't deleted")
        }
    }

    // Get Users Order | To User
    async myOrder(user: any, status: string, inStatus: any) {
        var filter:any = {"user_info._id": user._id}

        if(inStatus && status){
            if(inStatus === true || inStatus === 'true'){
                filter.status = status
            }else if(inStatus === false || inStatus === 'false'){
                filter.status = { $nin: [status] }
            }
        }else if(status){
            filter.status = status
        }

        // const fibo = fibonacci(2, 4, 3)
        // nextHours(new Date(), 1)

        const result = await this.orderModel.aggregate([
            {$match: filter},
            {$sort: { create_date: -1 } }
        ])

        return result
    }
}
