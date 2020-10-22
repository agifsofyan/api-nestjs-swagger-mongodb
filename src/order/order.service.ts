import { Injectable, NotFoundException, Req } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
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

@Injectable()
export class OrderService {
    constructor(
        @InjectModel('Order') private orderModel: Model<IOrder>,
        @InjectModel('Cart') private readonly cartModel: Model<ICart>,
        @InjectModel('Product') private readonly productModel: Model<IProduct>,
        @InjectModel('VA') private readonly vaModel: Model<IVA>,
        private readonly vaService: VaService
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

        const external_id = checkVA.va_id

        let items = input.items
        var total_qty = 0
        var total_price = 0
        var productArray = new Array()
        for(let i in items){
            total_qty += items[i].quantity
            productArray[i] = items[i].product_id

            await this.cartModel.findOneAndUpdate(
                { user_id: userId },
                {
                    $pull: { items: { product_id: items[i].product_id } }
                }
            );
        }
        
        const pay = await this.vaService.simulate_payment(userId, external_id, total_price)

        var product = await this.productModel.find({ _id: { $in: productArray } })

        for(let i in product){
            total_price += ( product[i].sale_price > 0 ) ? product[i].sale_price : product[i].price

            if(product && product[i].type == 'ecommerce'){
                let obj = input.find(obj => obj.product_id == product[i]._id);
                await this.productModel.findOneAndUpdate(
                    { _id: product[i]._id },
                    { $set: { "ecommerce.stock": ( product[i].ecommerce.stock - obj.quantity ) } }
                )
            }
        }

        const order = await new this.orderModel({
            user_id: userId,
            items: items,
            ...input,
            total_qty: total_qty,
            total_price: total_price,
            payment_id: external_id
        })

        await order.save()

        return await order
    }
}
