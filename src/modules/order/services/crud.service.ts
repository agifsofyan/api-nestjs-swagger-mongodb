import { Injectable, NotFoundException, BadRequestException, NotImplementedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';

import { IOrder } from '../interfaces/order.interface';
import { IProduct } from 'src/modules/product/interfaces/product.interface';
import { PaymentService } from '../../payment/payment.service';
import { fibonacci, nextHours } from 'src/utils/helper';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class OrderCrudService {
    constructor(
        @InjectModel('Order') private orderModel: Model<IOrder>
    ) {}

    // Get All Order / Checkout 
    async findAll() {
        const query = await this.orderModel.find()

        // await this.statusChange(query)

        const result = await this.orderModel.aggregate([
            {$group: {
                    _id: "$_id",
                    user_info: { $first: "$user_info" },
                    items: { $push: "$items" },
                    coupon: { $first: "$coupon" },
                    payment: { $first: "$payment" },
                    shipment: { $first: "$shipment" },
                    total_qty: { $first: "$total_qty" },
                    total_price: { $first: "$total_price" },
                    create_date: { $first: "$create_date" },
                    expiry_date: { $first: "$expiry_date" },
                    invoice: { $first: "$invoice" },
                    status: { $first: "$status" }
            }},
            {$sort: { create_date: -1 } }
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
			throw new NotFoundException(`Could nod find topic with id ${orderId}`);
        }
        
        await this.orderModel.findOneAndUpdate(
            { _id: ObjectId(orderId) },
            { $set: {status} },
            { new: true, upsert: true }
        )

        return await this.orderModel.findOne({ _id: orderId });
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
    async myOrder(user: any, status: string) {
        // const query = await this.orderModel.find({user_info: user._id})
        // await this.statusChange(query)

        var filter:any = {"user_info._id": user._id}

        if(status){
            filter.status = status
        }

        // const fibo = fibonacci(2, 4, 3)
        // nextHours(new Date(), 1)

        const result = await this.orderModel.aggregate([
            {$match: filter},
            {$group: {
                    _id: "$_id",
                    items: { $push: "$items" },
                    coupon: { $first: "$coupon" },
                    payment: { $first: "$payment" },
                    shipment: { $first: "$shipment" },
                    total_qty: { $first: "$total_qty" },
                    total_price: { $first: "$total_price" },
                    create_date: { $first: "$create_date" },
                    expiry_date: { $first: "$expiry_date" },
                    invoice: { $first: "$invoice" },
                    status: { $first: "$status" }
            }},
            {$sort: { create_date: -1 } }
        ])

        return result
    }
}
