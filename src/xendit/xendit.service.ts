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
        const i = xendit.Invoice({});

        const { cart } = session;
        const cartItem = prepareCart(cart);

        try {
            const res = await i.createInvoice({
                externalID: `ORDER-${uuidv4}`,
                amount: cartItem.total_price,
                payer_email: user.email,
                description: 'Purchase Invoice',
                should_send_email: true,
                currency: 'IDR',
                reminder_time: 1
            });
            console.log(res);
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
