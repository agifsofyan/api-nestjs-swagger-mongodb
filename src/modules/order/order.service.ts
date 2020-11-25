import { Injectable, NotFoundException, BadRequestException, Req, NotImplementedException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';

import { IOrder } from './interfaces/order.interface';

import { ICart } from '../cart/interfaces/cart.interface';
import { IProduct } from '../product/interfaces/product.interface';
import { PaymentService } from '../payment/payment.service';
import { ShipmentService } from '../shipment/shipment.service';

import { CouponService } from '../coupon/coupon.service';

import { expiring, toInvoice } from 'src/utils/order';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class OrderService {
    constructor(
        @InjectModel('Order') private orderModel: Model<IOrder>,
        @InjectModel('Cart') private readonly cartModel: Model<ICart>,
        @InjectModel('Product') private readonly productModel: Model<IProduct>,
        private paymentService: PaymentService,
        private shipmentService: ShipmentService,
        private couponService: CouponService,
    ) {}
    
    async store(user: any, input: any){
        let userId = null
        if (user != null) {
            userId = user._id
        }

        console.log('user', user)
        console.log('userId', userId)
        
        let items = input.items
        input.total_qty = 0
	    var weight = 0
        var sub_qty = new Array()
        var sub_price = new Array()
        var bump_price = new Array()
        var productArray = new Array()
        var arrayPrice = new Array()
        var linkItems = new Array()
        var shipmentItem = new Array()
        var productType = new Array()

        var cartArray = new Array()
        
        for(let i in items){
            cartArray[i] = ObjectId(items[i].product_id)

            input.total_qty += (!items[i].quantity) ? 1 : items[i].quantity

            sub_qty[i] = (!items[i].quantity) ? 1 : items[i].quantity 
        }

        try {
            productArray = await this.cartModel.find(
                {$and: [
                    { user_id: userId },
                    { 'items.product_id': { $in: cartArray }}
                ]}
            )

            if(cartArray.length !== productArray.length){
                throw new NotFoundException('your product selected not found in the cart')
            }

            productArray = await this.productModel.find({ _id: { $in: cartArray } })

            if(productArray.length <= 0){
                throw new NotFoundException(`product id in: [${cartArray}] not found in product list`)
            }
        } catch (error) {
            throw new BadRequestException(`product id bad format`)
        }

        for(let i in items){
            sub_price[i] = productArray[i].sale_price <= 0 ? productArray[i].price : productArray[i].sale_price
            items[i].sub_price = sub_price[i]

            bump_price[i] = (!items[i].is_bump) ? 0 : ( productArray[i].bump.length > 0 ? (productArray[i].bump[0].bump_price ? productArray[i].bump[0].bump_price : 0) : 0)
            
	        items[i].bump_price = bump_price[i]

            arrayPrice[i] = ( sub_qty[i] * sub_price[i] ) + bump_price[i]
            /**
             * LinkAja - `Items`
             */
            linkItems[i] = {
                id: productArray[i]._id,
                name: productArray[i].name,
                price: arrayPrice[i],
                quantity: items[i].quantity
            }

            productType[i] = productArray[i].type

            if(productArray[i].type === 'ecommerce'){
                if(!input.shipment || !input.shipment.address_id){
                    throw new BadRequestException('shipment.address_id is required, because your product type is ecommerce')
                }

                shipmentItem[i] = {
                    item_description: productArray[i].name,
                    quantity: items[i].quantity,
                    is_dangerous_good: false
                }
                
                weight += productArray[i].ecommerce.weight
            }
        }
	
        input.total_price = arrayPrice.reduce((a,b) => a+b, 0)

        if(input.coupon && input.coupon.code){
            const couponExecute = await this.couponService.calculate(input.coupon.code, input.total_price)
		//console.log('couponExecute', couponExecute)
            const { coupon, value } = couponExecute

            input.coupon = {...coupon}
            input.coupon.id = coupon._id

            input.total_price -= value
        }
	
        const track = toInvoice(new Date())
	    input.invoice = track.invoice
        
        const addressHandle = productType.filter(p => p === 'ecommerce')
        if(addressHandle.length >= 1){
            const shipmentDto = {
                requested_tracking_number: track.tracking,
                merchant_order_number: track.invoice,
                address_id: input.shipment.address_id,
                items: shipmentItem,
                weight: weight
            }
            
            const shipment = await this.shipmentService.add(user, shipmentDto)
            input.shipment.shipment_id = shipment._id
        }

        if(addressHandle.length < 1 && input.shipment && input.shipment.address_id){
            input.shipment.address_id = null
        }

        input.invoice = track.invoice

        try {
            const order = await new this.orderModel({
                "user_id": userId,
                "items": items,
                ...input
            })
            
            await order.save()

            return order
        } catch (error) {
            throw new InternalServerErrorException('An error occurred while removing an item from the cart or reducing stock on the product or when save order')
        }
    }

    // ##########################
    // to Backoffice

    // Get All Order / Checkout 
    async findAll() {
        var query = await this.orderModel.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user_info'
                }
            },
            {
                $unwind: {
                    path: '$user_info',
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
                $lookup: {
                    from: 'shipments',
                    localField: 'shipment.shipment_id',
                    foreignField: '_id',
                    as: 'shipment.shipment_info'
                }
            },
            {
                $unwind: {
                    path: '$shipment.shipment_info',
                    preserveNullAndEmptyArrays: true
                }
            },
            { 
                $addFields: {
                    "shipment.shipment_info": "$shipment.shipment_info",
                    status: { $cond: {
                        if: { $and: [ {status: { $not: "PAID" }}, {$gte: ["$expiry_date", new Date()]} ] },
                        then: "$status",
                        else: "EXPIRED"
                    }}
                }
            },
            {   $project: {
                    "user_info._id": 1,
                    "user_info.name": 1,
                    "user_info.email": 1,
                    "user_info.phone_number": 1,
                    "payment": 1,
                    "items.variant": 1,
                    "items.note": 1,
                    "items.quantity": 1,
                    "items.is_bump": 1,
                    "items.bump_price": 1,
                    "items.sub_price": 1,
                    "items.product_info._id": 1,
                    "items.product_info.name": 1,
                    "items.product_info.type": 1,
                    "items.product_info.visibility": 1,
                    "items.product_info.price": 1,
                    "items.product_info.sale_price": 1,
                    "items.product_info.bump": 1,
                    "items.product_info.topic": 1,
                    "items.product_info.created_by": 1,
                    "items.product_info.agent": 1,
                    "shipment.shipment_info": 1,
                    "total_qty": 1,
                    "total_price": 1,
                    "create_date": 1,
                    "expiry_date": 1,
                    "invoice": 1,
                    "status": 1
                }
            },
            {   $group: {
                    _id: "$_id",
                    user_info:{ $first: "$user_info" },
                    items: { $push: "$items" },
                    item_count: { $sum: 1 },
                    payment: { $first: "$payment" },
                    shipment: { $first: "$shipment" },
                    total_qty: { $first: "$total_qty" },
                    total_price: { $first: "$total_price" },
                    create_date: { $first: "$create_date" },
                    expiry_date: { $first: "$expiry_date" },
                    invoice: { $first: "$invoice" },
                    status: { $first: "$status" }
                }
            },
            {   $sort : { create_date: -1 } }
        ])

        // return query

        if(query.length <= 0){
            return []
        }else{
            return await Promise.all(query.map(async (q) => {
                console.log("payment", q.payment)
                // var status = (q.payment === undefined) ? null : await this.paymentService.callback(q.payment)
                // q.payment.status = status
                // q.payment.status = (q.payment === undefined) ? q.payment.status : await this.paymentService.callback(q.payment)
                return q
            }));
        }
    }

    // Get Detail Order / Checkout by ID
    async findById(order_id: string): Promise<IOrder> {
        var checkOrder: any
        try {
            checkOrder = await this.orderModel.findById(order_id)
        } catch (error) {
            throw new BadRequestException(`format Order Id not valid`)
        }
		
		if(!checkOrder){
			throw new NotFoundException(`Order Id not found`)
        }

        const getStatus = await this.paymentService.callback(checkOrder.payment)

        const status = (!getStatus) ? checkOrder.payment.status : getStatus
 
        
        const query = await this.orderModel.aggregate([
            {
                $match: { "_id": ObjectId(checkOrder._id) }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user_info'
                }
            },
            {
                $unwind: {
                    path: '$user_info',
                    preserveNullAndEmptyArrays: true
                }
            },
            { 
                $addFields: {
                    "payment.status": status
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
                $lookup: {
                    from: 'shipments',
                    localField: 'shipment.shipment_id',
                    foreignField: '_id',
                    as: 'shipment.shipment_info'
                }
            },
            {
                $unwind: {
                    path: '$shipment.shipment_info',
                    preserveNullAndEmptyArrays: true
                }
            },
            { 
                $addFields: {
                    "shipment.shipment_info": "$shipment.shipment_info",
                    status: { $cond: {
                        if: { $and: [ {status: { $not: "PAID" }}, {$gte: ["$expiry_date", new Date()]} ] },
                        then: "$status",
                        else: "EXPIRED"
                    }}
                }
            },
            { 
                $project: {
                    user_id: 1,
                    "user_info._id": 1,
                    "user_info.name": 1,
                    "user_info.email": 1,
                    "user_info.phone_number": 1,
                    "payment": 1,
                    items: 1,
                    shipment: 1,
                    total_qty: 1,
                    total_price: 1,
                    create_date: 1,
                    expiry_date: 1,
                    invoice: 1,
                    status: 1
                }
            },
            {
                $group: {
                    _id: "$_id",
                    user_id:{ $first: "$user_id" },
                    user_info:{ $first: "$user_info" },
                    payment: { $first: "$payment" },
                    items: { $push: "$items" },
		            shipment: { $first: "$shipment" },
                    total_qty: { $first: "$total_qty" },
                    total_price: { $first: "$total_price" },
                    create_date: { $first: "$create_date" },
                    expiry_date: { $first: "$expiry_date" },
                    invoice: { $first: "$invoice" },
                    status: { $first: "$status" }
                }
            }
        ])

        return query.length > 0 ? query[0] : {}
    }

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

        return await this.findById(orderId);
    }

    async drop(orderId: string) {
        try {
            await this.orderModel.deleteOne({ _id: ObjectId(orderId) })
            return 'ok'
        } catch (error) {
            throw new NotImplementedException("the order can't deleted")
        }
    }

    async myOrder(user: any) {
        try {
            // return await this.findByUser(user["_id"])

            // const query = await this.productModel.aggregate([
            //     {
            //         $lookup: {
            //             from: 'topics',
            //             localField: 'topic',
            //             foreignField: '_id',
            //             as: 'topic_in'
            //         }
            //     },
                // {
                //     $unwind: '$created_by'
                // },
                // {   
                //     $project: {
                //         "created_by": 1,
                //         "admin_info": {
                //             $map: {
                //                 input: "$admin_info",
                //                 as: "admin_info",
                //                 in: {
                //                     _id: "$$admin_info._id",
                //                     name: "$$admin_info.name",
                //                     slug: "$$admin_info.slug",
                //                     icon: "$$admin_info.icon",
                //                 }
                //             }
                //         }
                //     }
                // }
                // { $group: {
                //     _id: "$_id",
                //     admin_info: { $push: "$created_by" }
                // }}
            // ])

            // return query
        } catch (error) {
            throw new NotFoundException('order is empty')
        }
    }
}
