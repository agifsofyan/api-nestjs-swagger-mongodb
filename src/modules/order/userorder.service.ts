import { Injectable, NotFoundException, BadRequestException, NotImplementedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';

import { IOrder } from './interfaces/order.interface';
import { IProduct } from '../product/interfaces/product.interface';
import { PaymentService } from '../payment/payment.service';
import { expiring } from 'src/utils/order';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class UserOrderService {
    constructor(
        @InjectModel('Order') private orderModel: Model<IOrder>,
        @InjectModel('Product') private readonly productModel: Model<IProduct>,
        private paymentService: PaymentService
    ) {}
    
    async pay(user: any, order_id: any, input: any){
        const username = user.name
        var order
        try {
            order = await this.orderModel.findById(order_id)

            if(!order){
                throw new NotFoundException('order not found')
            }
        } catch (error) {
            throw new NotImplementedException('order id not valid format')
        }

        // console.log("input", input)
        if(!input.payment.method){
            throw new BadRequestException('payment.method is required')
        }

        const items = order.items
        var productIDS = new Array()
        for(let i in items){
            productIDS[i] = items[i].product_id
        }

        const products = await this.productModel.find({ _id: { $in: productIDS } })
        if(productIDS.length !== products.length){
            throw new NotFoundException('product not found in order')
        }

        /**
         * LinkAja - `Items`
         */
        var linkItems = new Array()
        for(let i in products){
            linkItems[i] = {
                id: products[i].id,
                name: products[i].name,
                price: products[i].price,
                quantity: (!items[i].quantity) ? 1 : items[i].quantity,
            }
        }

        input.expiry_date = expiring(2)

        const orderKeys = {
            amount: order.total_price,
            method_id: input.payment.method,
            external_id: order.invoice,
            expired: input.expiry_date
        }

        console.log("orderKeys", orderKeys)
        
        const toPayment = await this.paymentService.prepareToPay(orderKeys, username, linkItems)
        
        console.log("toPayment", toPayment)
        
        input.payment =  {...toPayment}

        try {
            await this.orderModel.findByIdAndUpdate(order_id, input)
            return await this.orderModel.findById(order_id)
        } catch (error) {
            throw new NotImplementedException("can't update order")
        }
    }

    async myOrder(user: any) {
        console.log('user', user)
        const query = await this.orderModel.aggregate([
            { $match: { user_id: user._id} },
            {
                $lookup: {
                    from: 'payment_methods',
                    localField: 'payment.method',
                    foreignField: '_id',
                    as: 'payment.method'
                }
            },
            {
                $unwind: {
                    path: '$payment.method',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: '$items',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.product_id',
                    foreignField: '_id',
                    as: 'items.product_info'
                }
            },
            {
                $unwind: '$items.product_info'
            },
            { 
                $addFields: {
                    status: { $cond: {
                        if: { $and: [ {status: { $not: "PAID" }}, {$gte: ["$expiry_date", new Date()]} ] },
                        then: "$status",
                        else: "EXPIRED"
                    }}
                }
            },
            { 
                $project: {
                    payment: 1,
                    items: 1,
                    total_qty: 1,
                    total_price: 1,
                    create_date: 1,
                    expiry_date: 1,
                    status: 1
                }
            },
            { $sort : { create_date: -1 } },
        ])

        return query
    }
}
