import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import Xendit from 'xendit-node';

import { XENDIT_SECRET_KEY } from '../config/configuration';
import { prepareCart } from '../utils';
import { IUser } from '../user/interfaces/user.interface';

@Injectable()
export class XenditService {
    constructor() {}

    async xenditInvoice(session, user: IUser): 
    Promise<{ error: string; data: any; cart: any; user: IUser; }> {
        const xendit = new Xendit({ secretKey: XENDIT_SECRET_KEY });
        const { Invoice } = xendit;
        const issue = new Invoice({});

        const { cart } = session;
        const cartItem = prepareCart(cart);
        const orderId = `ORDER-${uuidv4}`;

        try {
            const res = await issue.createInvoice({
                externalID: orderId,
                amount: cartItem.total_price,
                payer_email: user.email,
                description: 'Purchase Invoice',
                should_send_email: true,
                currency: 'IDR',
                reminder_time: 1
            });
            return { error: null, data: res, cart, user }   
        } catch (error) {
            console.log(error.message);
            return { 
                error: 'Failed to issue invoice with Xendit', 
                data: null, 
                cart: null, 
                user: null 
            }
        }
    }
}
