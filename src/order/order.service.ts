import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { prepareCart } from '../utils';
import { IOrder } from './interfaces/order.interface';
import { OrderDTO } from './dto/order.dto';
import { ICart } from '../cart/interfaces/cart.interface';
import { IUser } from '../user/interfaces/user.interface';
import { XENDIT } from '../config/configuration';

@Injectable()
export class OrderService {
    constructor(@InjectModel('Order') private orderModel: Model<IOrder>) {}

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

        const order = { 
            ...invoice, 
            invoiceId: invoice.id,
            user,
            created_at: invoice.created, 
            updated_at: invoice.updated 
        };

        if (invoice) {
            try {
                const issueOrder = await new this.orderModel(this.create(order, cartItem));
                issueOrder.save();   
                return { error: '', data: issueOrder };
            } catch (error) {
                return { error: 'Failed to issue order', data: null };
            }
        } else {
            return { error: 'Failed to issue invoice with Xendit', data: null };
        }
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
