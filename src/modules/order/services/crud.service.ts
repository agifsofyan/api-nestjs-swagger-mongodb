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
        return await this.orderModel.find({ user_info: user._id }).then((res) => {
		if(res.length > 0){
			return res.map(r => {
				const order = r.toObject()
				delete order.user_info
				return order
			})        
		}
		
		return res
        })
    }
}
