import { Injectable, NotFoundException, BadRequestException, Req } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IOrder } from './interfaces/order.interface';

import { ICart } from '../newCart/interfaces/cart.interface';
import { IProduct } from '../product/interfaces/product.interface';
import { IPaymentAccount as IPA } from '../payment/account/interfaces/account.interface';
import { PaymentService } from '../payment/payment.service';
import { PaymentMethodService } from '../payment/method/method.service';

import { expiring } from '../utils/order';
import { OptQuery } from '../utils/optquery';

@Injectable()
export class OrderService {
    constructor(
        @InjectModel('Order') private orderModel: Model<IOrder>,
        @InjectModel('Cart') private readonly cartModel: Model<ICart>,
        @InjectModel('Product') private readonly productModel: Model<IProduct>,
        @InjectModel('PaymentAccount') private readonly paModel: Model<IPA>,
        private paymentService: PaymentService,
        private pmService: PaymentMethodService
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

            bump_price[i] = (!items[i].is_bump) ? 0 : productArray[i].bump[0].bump_price
            items[i].bump_price = bump_price[i]

            await this.cartModel.findOneAndUpdate(
                { user_id: userId },
                {
                    $pull: { items: { product_id: items[i].product_id } }
                }
            );

            if(productArray[i] && productArray[i].type == 'ecommerce'){

                if(productArray[i].ecommerce.stock <= 0){
                    throw new BadRequestException('ecommerce stock is empty')
                }

                productArray[i].ecommerce.stock -= items[i].quantity
                productArray[i].save()
            }

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

        console.log('input.total_price',  input.total_price)

        if(!input.payment || !input.payment.method ){
            throw new BadRequestException('payment method is required')
        }

        var checkPM
        try {
            checkPM = await this.pmService.getById(input.payment.method) 
        } catch (error) {
            throw new BadRequestException(`payment method with id ${input.payment.method} not valid`)
        }

        if(!checkPM){
            throw new NotFoundException(`payment method with id ${input.payment.method} not found`)
        }

        const checkPA = await this.paModel.findOne({user_id: userId, payment_type: input.payment.method})
        console.log('checkPA',  checkPA)

        if(!checkPA){
            throw new NotFoundException(`You don't have a ${checkPM.info}, please create ${checkPM.info} first`)
        }

        const payment_type = input.payment_type
        const amount = input.total_price
        const external_id = checkPA.external_id
        const phone = checkPA.phone_number
        const domain = process.env.DOMAIN
        var body = {}

        /** Payment Service */
        switch(payment_type){
            case 'ALFAMART' || 'INDOMARET':
                body = {          
                    external_id: external_id,                                                                                    
                    retail_outlet_name: checkPA.retail_outlet_name,
                    transfer_amount: amount
                }
            break;

            case 'OVO':
                body = {
                    external_id: external_id,
                    amount: amount,
                    phone: phone,
                    ewallet_type:"OVO"
                }
            break;

            case 'DANA':
                body = {
                    external_id: external_id,
                    amount: amount,
                    expiration_date: expiring,
                    callback_url:`${domain}/callbacks`,
                    redirect_url:`${domain}/home`,
                    ewallet_type:"DANA"
                }
            break;

            case 'LINKAJA':
                body = {
                    external_id: external_id,
                    phone: phone,
                    amount: amount,
                    items: linkItems,
                    callback_url: `${domain}/callbacks`,
                    redirect_url: "https://xendit.co/",
                    ewallet_type: "LINKAJA"
                }
            break;

            case 'VISA' || 'MASTERCARD' || 'JCB':
                body = {
                    token_id : "5caf29f7d3c9b11b9fa09c96",
                    external_id: external_id,
                    amount: amount
                }
            break;

            default:
                body = {
                    external_id: external_id,
                    amount: amount,
                    expiration_date: expiring
                }
        }
        // ###############
        
        try {
            const payment = await this.paymentService.pay(payment_type, body)
            console.log('payment', payment.data)
            
            input.payment =  {
                method: input.payment.method,
                account: checkPA._id,
                status: payment.data.status,
                external_id: external_id
            }
            const order = await new this.orderModel({
                user_id: userId,
                items: items,
                ...input
            })
            
            await order.save()
            // return payment.data
            return order
        } catch (error) {
            throw new BadRequestException('Payment To xendit not working')
        }
    }

    // ##########################
    // to Backoffice

    // Get All Order / Checkout 
    async findAll(options: OptQuery): Promise<IOrder[]> {
        const {
            offset,
            limit,
            sortby,
            sortval,
            fields,
            value,
            optFields,
            optVal
        } = options;

        const offsets = (offset == 0 ? offset : (offset - 1))
        const skip = offsets * limit
        const sortvals = (sortval == 'asc') ? 1 : -1

        var filter: object = { [fields]: value }

        if (optFields) {
            if (!fields) {
                filter = { [optFields]: optVal }
            }
            filter = { [fields]: value, [optFields]: optVal }
        }

        if (sortby){
            if (fields) {

                return await this.orderModel
                    .find(filter)
                    .skip(Number(skip))
                    .limit(Number(limit))
                    .sort({ [sortby]: sortvals })

            } else {

                return await this.orderModel
                    .find()
                    .skip(Number(skip))
                    .limit(Number(options.limit))
                    .sort({ [options.sortby]: sortvals })
            }
        }else{
            if (options.fields) {

                return await this.orderModel
                    .find(filter)
                    .skip(Number(skip))
                    .limit(Number(options.limit))
                    .sort({ 'updated_at': 'desc' })

            } else {

                return await this.orderModel
                    .find(filter)
                    .skip(Number(skip))
                    .limit(Number(options.limit))
                    .sort({ 'updated_at': 'desc' })
            }
        }
    }

    // Get Detail Order / Checkout by ID
    async findById(id: string): Promise<IOrder> {
        let result
        try {
            result = await this.orderModel.findById(id)
            .populate('user_id', ['name', 'email', 'phone_number'])
            .populate('payment.account', ['account_name', 'account_number', 'account_email', 'external_id', 'retail_outlet_name', 'bank_code', 'phone_number', 'expiry'])
        } catch (error) {
            throw new NotFoundException(`Could nod find product with id ${id}`)
        }

        if (!result) {
            throw new NotFoundException(`Could nod find product with id ${id}`)
        }

        return result
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
