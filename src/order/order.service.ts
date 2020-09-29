import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { prepareCart } from '../utils';
import { IOrder } from './interfaces/order.interface';
import { OrderDTO } from './dto/order.dto';
import { ICart } from '../cart/interfaces/cart.interface';
import { IUser } from 'src/user/interfaces/user.interface';

@Injectable()
export class OrderService {
    constructor(@InjectModel('Order') private orderModel: Model<IOrder>) {}

    async checkout(data, cartItems, user: IUser) {
        const cart = prepareCart(cartItems);
        const order = { 
            ...data, 
            invoiceId: data.id,
            user,
            created_at: data.created, 
            updated_at: data.updated 
        };

        const issueOrder = await this.orderModel(this.create(order, cart));
        issueOrder.save();

        return issueOrder;
    }

    private create = (orderDTO: OrderDTO, cart: ICart) => {
        const {
            orderId,
            invoiceId,
            user,
            amount,
            payer_email,
            description,
            address,
            invoice_url,
            expiry_date,
            created_at,
            updated_at
        } = orderDTO;

        const userId = user ? { user } : {};
        const invoice = invoiceId ? { invoiceId } : {};
        const priceAmount = amount ? { amount } : { amount: cart.total_price };
        const createdAt = created_at ? { created_at } : {};
        const updatedAt = updated_at ? { updated_at } : {};

        return {
            orderId,
            invoice,
            amount: priceAmount,
            payer_email,
            description,
            cart,
            address,
            invoice_url,
            expiry_date,
            createdAt,
            updatedAt,
            ...userId
        }
    }
}
