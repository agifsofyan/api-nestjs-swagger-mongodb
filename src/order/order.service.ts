import { Injectable, NotFoundException, BadRequestException, Req } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { prepareCart } from '../utils';
import { IOrder } from './interfaces/order.interface';
import { OrderDto, SearchDTO } from './dto/order.dto';
// import { ICart } from '../cart.original/interfaces/cart.interface';
import { IUser } from '../user/interfaces/user.interface';
import { XENDIT } from '../config/configuration';

import { ICart, IItemCart } from '../newCart/interfaces/cart.interface';
import { IProduct } from '../product/interfaces/product.interface';
import { IVirtualAccount as IVA } from '../payment/virtualaccount/interfaces/va.interface';

import { VaService } from '../payment/virtualaccount/va.service';

import { OptQuery } from '../utils/optquery';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class OrderService {
    constructor(
        @InjectModel('Order') private orderModel: Model<IOrder>,
        @InjectModel('Cart') private readonly cartModel: Model<ICart>,
        @InjectModel('Product') private readonly productModel: Model<IProduct>,
        @InjectModel('VA') private readonly vaModel: Model<IVA>,
        private vaService: VaService
    ) {}

    async checkout(user: IUser, session): Promise<{ error: string; data: IOrder; }> {
        const { cart } = session;
        const cartItem = prepareCart(cart);

        const { Invoice } = XENDIT;
        const i = new Invoice({});
        
        const oderId = 'ORDER-' + uuidv4();

        const invoice = await i.createInvoice({
            externalID: oderId.toUpperCase(),
            amount: cartItem.total_price,
            payerEmail: user.email,
            description: 'Purchase Invoice',
            should_send_email: true,
            reminder_time: 1
        });

        // Hide user password
        delete user.password;

        const body = { 
            ...invoice,
            order_id: invoice.external_id,
            invoice_id: invoice.id,
            user,
            created_at: invoice.created,
            updated_at: invoice.updated 
        };

        if (invoice) {
            try {
                // const order = new this.orderModel(this.create(body, cartItem));
                // await order.save();   
                // return { error: '', data: order };
            } catch (error) {
                return { error: 'Failed to issue order', data: null };
            }
        } else {
            return { error: 'Failed to issue invoice with Xendit', data: null };
        }
    }

    // private create = (orderDTO: OrderDTO, cart: ICart) => {
    //     const {
    //         order_id,
    //         invoice_id,
    //         user,
    //         status,
    //         merchant_name,
    //         merchant_profile_picture_url,
    //         currency,
    //         amount,
    //         payer_email,
    //         description,
    //         address,
    //         invoice_url,
    //         expiry_date,
    //         created_at,
    //         updated_at
    //     } = orderDTO;

    //     // const orderId = order_id ? { order_id } : {};
    //     // const userId = user ? { user } : {};
    //     // const invoice = invoice_id ? { invoice_id } : {};
    //     // const createdAt = created_at ? { created_at } : {};
    //     // const updatedAt = updated_at ? { updated_at } : {};

    //     return {
    //         order_id,
    //         invoice_id,
    //         user,
    //         status,
    //         merchant_name,
    //         merchant_profile_picture_url,
    //         currency,
    //         amount,
    //         payer_email,
    //         description,
    //         invoice_url,
    //         expiry_date,
    //         cart,
    //         address,
    //         created_at,
    //         updated_at
    //     }
    // }

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
                    .populate('user', ['_id', 'name', 'email', 'phone_number', 'type', 'avatar'])

            } else {

                return await this.orderModel
                    .find()
                    .skip(Number(skip))
                    .limit(Number(options.limit))
                    .sort({ [options.sortby]: sortvals })
                    .populate('user', ['_id', 'name', 'email', 'phone_number', 'type', 'avatar'])

            }
        }else{
            if (options.fields) {

                return await this.orderModel
                    .find(filter)
                    .skip(Number(skip))
                    .limit(Number(options.limit))
                    .sort({ 'updated_at': 'desc' })
                    .populate('user', ['_id', 'name', 'email', 'phone_number', 'type', 'avatar'])

            } else {

                return await this.orderModel
                    .find(filter)
                    .skip(Number(skip))
                    .limit(Number(options.limit))
                    .sort({ 'updated_at': 'desc' })
                    .populate('user', ['_id', 'name', 'email', 'phone_number', 'type', 'avatar'])
            }
        }
    }

    // Get Detail Order / Checkout by ID
    async findById(id: string): Promise<IOrder> {
        let result
        try {
            result = await this.orderModel.findById(id)
                .populate('user', ['_id', 'name', 'email', 'phone_number', 'type', 'avatar'])
        } catch (error) {
            throw new NotFoundException(`Could nod find product with id ${id}`)
        }

        if (!result) {
            throw new NotFoundException(`Could nod find product with id ${id}`)
        }

        return result
    }

    // Search Order
    async search(value: SearchDTO): Promise<IOrder[]> {
        const result = await this.orderModel.find({ $text: { $search: value.search } }).populate('user', ['_id', 'name', 'email', 'phone_number', 'type', 'avatar'])

		if (!result) {
			throw new NotFoundException("Your search was not found")
		}

		return result
    }
    
    async store(user: any, input: any){
        let userId = null
        if (user != null) {
            userId = user.userId
        }

        const checkVA = await this.vaModel.findOne({ user_id: userId })
        if(!checkVA){
            throw new NotFoundException("You don't have a virtual account, please create your virtual account first")
        }

        const external_id = checkVA.external_id

        input.payment_id = checkVA._id

        let items = input.items
        input.total_qty = 0
        var sub_qty = new Array()
        var sub_price = new Array()
        var bump_price = new Array()
        var productArray = new Array()
        var arrayPrice = new Array()
        var checkCart = new Array()
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
                productArray[i].ecommerce.stock -= items[i].quantity
                productArray[i].save()
            }

            arrayPrice[i] = ( sub_qty[i] * sub_price[i] ) + bump_price[i]
        }
        
        input.total_price = arrayPrice.reduce((a,b) => a+b, 0)
        
        try {
            await this.vaService.simulate_payment(external_id, input.total_price)
        } catch (error) {
            throw new BadRequestException('Payment To xendit not working')
        }
        
        const order = await new this.orderModel({
            user_id: userId,
            items: items,
            ...input
        })

        await order.save()

        return await order
    }
}
