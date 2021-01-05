import { Injectable, NotFoundException, BadRequestException, NotImplementedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';

import { IOrder } from '../interfaces/order.interface';
import { IProduct } from 'src/modules/product/interfaces/product.interface';
import { PaymentService } from '../../payment/payment.service';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class CRUDService {
    constructor(
        @InjectModel('Order') private orderModel: Model<IOrder>,
        @InjectModel('Product') private readonly productModel: Model<IProduct>,
        private readonly paymentService: PaymentService
    ) {}

    private async statusChange(array){
        var checkStatus = new Array()
        for (let i in array){
            if (array[i].payment && array[i].payment.method){
                if (array[i].payment.status === 'PENDING' || array[i].payment.status === 'FAILED' || array[i].payment.status === 'deny' || array[i].payment.status === 'ACTIVE'){
                    checkStatus[i] = await this.paymentService.callback(array[i].payment)
                    if (checkStatus[i] === 'COMPLETED' || checkStatus[i] === 'PAID' || checkStatus[i] === 'SUCCESS_COMPLETED' || checkStatus[i] === 'SETTLEMENT'){
                        await this.orderModel.findByIdAndUpdate(array[i]._id,
                            {"payment.status": checkStatus[i], "status": "PAID"},
                            {new: true, upsert: true}
                        )
                    }else if(checkStatus[i] === 'EXPIRED' || checkStatus[i] === 'expire'){
                        await this.orderModel.findByIdAndUpdate(array[i]._id,
                            {"payment.status": checkStatus[i], "status": "EXPIRED"},
                            {new: true, upsert: true}
                        )
                    }
                }
            }
        }

        return checkStatus
    }

    // Get All Order / Checkout 
    async findAll() {
        const query = await this.orderModel.find()

        await this.statusChange(query)

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
        const query = await this.orderModel.find({user_info: user._id})
        console.log('query', query)
        const parseStatus = await this.statusChange(query)
        console.log('parseStatus', parseStatus)

        const result = await this.orderModel.aggregate([
            {$match: {"user_info._id": user._id}},
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

        console.log('result', result)

        return result
    }
}
