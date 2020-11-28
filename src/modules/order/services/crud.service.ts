import { Injectable, NotFoundException, BadRequestException, NotImplementedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';

import { IOrder } from '../interfaces/order.interface';
import { IProduct } from 'src/modules/product/interfaces/product.interface';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class CRUDService {
    constructor(
        @InjectModel('Order') private orderModel: Model<IOrder>,
        @InjectModel('Product') private readonly productModel: Model<IProduct>,
    ) {}

    // Get All Order / Checkout 
    async findAll() {
        return await this.orderModel.find()
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
    async myOrder(user: any) {
        const order = await this.orderModel.find({ user_info: user._id });
        // const order = await this.orderModel.aggregate([
            // { $sort : { _id: -1 } }
            // { $match: { "user_info._id": user._id } },
            // {$group: {
            //     _id: "$_id",
            //     // user_info:{ $first: "$user_info" },
            //     item_count: { $sum: 1 },
            //     items: { $push: "$items" },
            //     payment: { $first: "$payment" },
            //     shipment: { $first: "$shipment" },
            //     total_qty: { $first: "$total_qty" },
            //     total_price: { $first: "$total_price" },
            //     create_date: { $first: "$create_date" },
            //     expiry_date: { $first: "$expiry_date" },
            //     invoice: { $first: "$invoice" },
            //     status: { $first: "$status" }
            // }}
        // ])
        // console.log('order', order)
        return order
    }
}
