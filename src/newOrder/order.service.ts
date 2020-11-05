import { Injectable, NotFoundException, BadRequestException, Req, NotImplementedException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';

import { IOrder } from './interfaces/order.interface';

import { ICart } from '../newCart/interfaces/cart.interface';
import { IProduct } from '../product/interfaces/product.interface';
import { PaymentService } from '../payment/payment.service';

import { StrToUnix, UnixToStr } from '../utils/optquery';
import { expiring } from 'src/utils/order';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class OrderService {
    constructor(
        @InjectModel('Order') private orderModel: Model<IOrder>,
        @InjectModel('Cart') private readonly cartModel: Model<ICart>,
        @InjectModel('Product') private readonly productModel: Model<IProduct>,
        private paymentService: PaymentService
    ) {}
    
    async store(user: any, input: any){
        let userId = null
        if (user != null) {
            userId = user.userId
        }
        
        let items = input.items
        input.total_qty = 0
        var sub_qty = new Array()
        var sub_price = new Array()
        var bump_price = new Array()
        var productArray = new Array()
        var arrayPrice = new Array()
        var checkCart = new Array()
        var linkItems = new Array()
        for(let i in items){
            
            checkCart[i] = await this.cartModel.findOne(
                {$and: [
                    { user_id: userId },
                    { 'items.product_id': items[i].product_id}
                ]}
            )

            if(!checkCart[i]){
                throw new NotFoundException(`product_id [${i}] = [${items[i].product_id}] not found in your cart`)
            }

            input.total_qty += items[i].quantity

            sub_qty[i] = items[i].quantity

            try {
                productArray[i] = await this.productModel.findOne({ _id: items[i].product_id })
            } catch (error) {
                throw new BadRequestException(`product_id [${i}] = [${items[i].product_id}], format is wrong`)
            }
            
            if(!productArray[i]){
                throw new NotFoundException(`Your product_id [${i}] = [${items[i].product_id}] not found in product`)
            }

            sub_price[i] = (productArray[i].sale_price > 0) ? productArray[i].sale_price : productArray[i].price
            items[i].sub_price = sub_price[i]

            bump_price[i] = (!items[i].is_bump) ? 0 : ( productArray[i].bump.length > 0 ? (productArray[i].bump[0].bump_price ? productArray[i].bump[0].bump_price : 0) : 0)
            items[i].bump_price = bump_price[i]

            arrayPrice[i] = ( sub_qty[i] * sub_price[i] ) + bump_price[i]

            /**
             * Link Aja Items
             */
            linkItems[i] = {
                id: productArray[i]._id,
                name: productArray[i].name,
                price: arrayPrice[i],
                quantity: items[i].quantity
            }
        }
        
        input.total_price = arrayPrice.reduce((a,b) => a+b, 0)

        if(!input.payment || !input.payment.method ){
            throw new BadRequestException('payment method is required')
        }

        // var checkPA
        // var payment
        // try {
        //     checkPA = await this.paService.getAccount(userId, input.payment.method)
        //     payment = checkPA
        // } catch (error) {
        //     checkPA = await this.paService.switchStoreAccount(userId, input.payment.method, input.total_price)
        //     payment = checkPA.account
        // }

        // console.log(';c', payment)
        // const external_id = payment.external_id
        console.log('input', input)
        console.log('user', user)
        
        // const unix = StrToUnix('2020-10-21T05:01:23.971Z')
        // console.log('unix', unix)
        // var Da = "2020-11-05T08:35:39.000Z";
        var Da = "2051-11-03T17:00:00.000Z"
        var datum = new Date(Da);
        const da = datum.toUTCString();

        console.log('da', da)

        const okeh = StrToUnix(da)
        console.log('okeh', okeh)

        const dt = UnixToStr(1604565339 * 1000)
        console.log('dt', dt)
        
        // const payout = await this.paymentService.prepareToPay(input, userId, linkItems)
        // console.log('payout', payout)


        // input.payment =  {
        //     method: input.payment.method,
        //     status: payout.status,
        //     external_id: payout.external_id,
        //     message: payout.message,
        //     invoice_url: payout.invoice_url,
        //     payment_code: payout.payment_code,
        //     payment_id: `${payout.external_id}_${unix}`,
        //     pay_uid: payout.pay_uid,
        //     phone_number: payout.phone_number
        // }

        try {
            const order = await new this.orderModel({
                user_id: userId,
                items: items,
                ...input
            })

            console.log('order', order)
            
            // await order.save()

            // for(let i in items){
            //     await this.cartModel.findOneAndUpdate(
            //         { user_id: userId },
            //         {
            //             $pull: { items: { product_id: items[i].product_id } }
            //         }
            //     );
    
            //     if(productArray[i] && productArray[i].type == 'ecommerce'){
    
            //         if(productArray[i].ecommerce.stock <= 0){
            //             throw new BadRequestException('ecommerce stock is empty')
            //         }
    
            //         productArray[i].ecommerce.stock -= items[i].quantity
            //         productArray[i].save()
            //     }
            // }

            return order
        } catch (error) {
            throw new InternalServerErrorException('An error occurred while removing an item from the cart or reducing stock on the product')
        }
        
    }

    // ##########################
    // to Backoffice

    // Get All Order / Checkout 
    async findAll(): Promise<IOrder[]> {
        const query = await this.orderModel.aggregate([
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
                $lookup: {
                    from: 'payment_accounts',
                    localField: 'payment.account',
                    foreignField: '_id',
                    as: 'payment.account'
                }
            },
            {
                $unwind: {
                    path: '$payment.account',
                    preserveNullAndEmptyArrays: true
                }
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
            { $project: {
                user_id: 1,
                "user_info._id": 1,
                "user_info.name": 1,
                "user_info.email": 1,
                "user_info.phone_number": 1,
                payment: 1,
                items: 1,
                total_qty: 1,
                total_price: 1,
                expiry_date: 1
            }},
            {
                $group: {
                    _id: {
                        order_id: "$_id",
                        user_id: "$user_id",
                        user_info: "$user_info",
                        payment: "$payment",
                        total_qty: "$total_qty",
                        total_price: "$total_price",
                        expiry_date: "$expiry_date",
                    },
                    items: { $push: "$items" },
                    count: { $sum: 1 }
                }
            },
            { $sort : { user_id: 1, create_date: 1 } },
            { $group: {
                _id: "$_id.user_id",
                user_info:{ $first: "$_id.user_info" },
                orders_count: { $sum: 1 },
                orders: {
                    $push: {
                        order_id: "$_id.order_id",
                        payment: "$_id.payment",
                        items_count: "$count",
                        items: "$items",
                        total_qty: "$_id.total_qty",
                        total_price: "$_id.total_price",
                        expiry_date: "$_id.expiry_date",
                    }
                }
            }},
            { $sort : { _id: -1 } },
        ])

        return query
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

        const getStatus = await this.paymentService.getStatus(checkOrder.payment)
 
        console.log('getStatus', getStatus.data)
        
        const query = await this.orderModel.aggregate([
            {
                $match: { _id: ObjectId(order_id) }
            },
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
                $lookup: {
                    from: 'payment_accounts',
                    localField: 'payment.account',
                    foreignField: '_id',
                    as: 'payment.account'
                }
            },
            {
                $unwind: {
                    path: '$payment.account',
                    preserveNullAndEmptyArrays: true
                }
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
            { $addFields: {
				"payment.status": getStatus.data.status
			}},
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
            { $project: {
                user_id: 1,
                "user_info._id": 1,
                "user_info.name": 1,
                "user_info.email": 1,
                "user_info.phone_number": 1,
                payment: 1,
                items: 1,
                total_qty: 1,
                total_price: 1,
                expiry_date: 1
            }},
            {
                $group: {
                    _id: "$_id",
                    user_id:{ $first: "$user_id" },
                    user_info:{ $first: "$user_info" },
                    payment: { $first: "$payment" },
                    items: { $push: "$items" },
                    total_qty: { $first: "$total_qty" },
                    total_price: { $first: "$total_price" },
                    expiry_date: { $first: "$expiry_date" },
                    // payment_status: { $first:getStatus.data }
                }
            }
        ])

        return query.length > 0 ? query[0] : {}
    }

    async findByUser(user_id: string): Promise<IOrder[]> {
        const query = await this.orderModel.aggregate([
            { $match: {user_id:ObjectId(user_id)} },
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
                $lookup: {
                    from: 'payment_accounts',
                    localField: 'payment.account',
                    foreignField: '_id',
                    as: 'payment.account'
                }
            },
            {
                $unwind: {
                    path: '$payment.account',
                    preserveNullAndEmptyArrays: true
                }
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
            { $project: {
                user_id: 1,
                "user_info._id": 1,
                "user_info.name": 1,
                "user_info.email": 1,
                "user_info.phone_number": 1,
                payment: 1,
                items: 1,
                total_qty: 1,
                total_price: 1,
                expiry_date: 1
            }},
            {
                $group: {
                    _id: {
                        order_id: "$_id",
                        user_id: "$user_id",
                        user_info: "$user_info",
                        payment: "$payment",
                        total_qty: "$total_qty",
                        total_price: "$total_price",
                        expiry_date: "$expiry_date",
                    },
                    items: { $push: "$items" },
                    count: { $sum: 1 }
                }
            },
            { $sort : { user_id: 1, create_date: 1 } },
            { $group: {
                _id: "$_id.user_id",
                user_info:{ $first: "$_id.user_info" },
                orders_count: { $sum: 1 },
                orders: {
                    $push: {
                        order_id: "$_id.order_id",
                        payment: "$_id.payment",
                        items_count: "$count",
                        items: "$items",
                        total_qty: "$_id.total_qty",
                        total_price: "$_id.total_price",
                        expiry_date: "$_id.expiry_date"
                    }
                }
            }},
            { $sort : { _id: -1 } },
        ])

        return query.length > 0 ? query[0] : {}
    }

    // Search Order
    async search(value: any): Promise<IOrder[]> {
        const result = await this.orderModel.find({ $text: { $search: value.search } }).populate('user', ['_id', 'name', 'email', 'phone_number', 'type', 'avatar'])

		if (!result) {
			throw new NotFoundException("Your search was not found")
		}

		return result
    }
}
